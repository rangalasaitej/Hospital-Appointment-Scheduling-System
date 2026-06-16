const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const auth = require('../middleware/auth');
const fetch = require('node-fetch');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5001/api';

// POST /api/appointment-schedule/generate
router.post('/generate', auth(['admin', 'receptionist']), async (req, res) => {
    try {
        const { name } = req.body;

        // 1. Fetch all active patients with availability
        const patientsRaw = db.prepare(`
      SELECT p.id, p.priority, p.required_appointments
      FROM patients p WHERE p.status = 'pending'
    `).all();

        const patients = patientsRaw.map(p => {
            const avail = db.prepare('SELECT appointment_slot_id FROM patient_availability WHERE patient_id = ?').all(p.id);
            return { ...p, availability: avail.map(a => a.appointment_slot_id) };
        });

        // 2. Fetch all doctors with availability
        const doctorsRaw = db.prepare('SELECT id, max_patients_per_day FROM doctors').all();
        const doctors = doctorsRaw.map(d => {
            const avail = db.prepare('SELECT appointment_slot_id FROM doctor_availability WHERE doctor_id = ?').all(d.id);
            return { ...d, availability: avail.map(a => a.appointment_slot_id) };
        });

        // 3. Fetch all appointment slots
        const slots = db.prepare('SELECT * FROM appointment_slots ORDER BY date, start_time').all();

        // 4. Fetch all active consultation rooms
        const rooms = db.prepare('SELECT id, name FROM consultation_rooms WHERE is_active = 1').all();

        if (patients.length === 0) return res.status(400).json({ error: 'No pending patients found' });
        if (doctors.length === 0) return res.status(400).json({ error: 'No doctors found' });
        if (slots.length === 0) return res.status(400).json({ error: 'No appointment slots found' });
        if (rooms.length === 0) return res.status(400).json({ error: 'No consultation rooms found' });

        // 5. Call AI engine
        const aiResponse = await fetch(`${AI_ENGINE_URL}/solve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patients,
                doctors,
                slots,
                rooms,
                optimize: true
            }),
            timeout: 60000,
        });

        const aiResult = await aiResponse.json();

        if (!aiResult.success) {
            return res.status(422).json({ error: aiResult.error || 'AI engine failed to find a solution' });
        }

        // 6. Save appointment schedule to DB
        const scheduleId = uuidv4();
        const scheduleName = name || `Appointment Schedule ${new Date().toLocaleDateString('en-GB')}`;

        db.prepare(`
      INSERT INTO appointment_schedules (id, name, status, quality_score, backtracks, solve_time_ms, created_by)
      VALUES (?, ?, 'confirmed', ?, ?, ?, ?)
    `).run(
            scheduleId, scheduleName,
            aiResult.quality_score || 0,
            aiResult.stats?.backtracks || 0,
            aiResult.stats?.time_ms || 0,
            req.user.id
        );

        const insertAssignment = db.prepare(`
      INSERT INTO appointment_assignments (id, schedule_id, patient_id, doctor_id, consultation_room_id, appointment_slot_id, appointment_num)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        const insertAll = db.transaction((assignments) => {
            for (const a of assignments) {
                insertAssignment.run(uuidv4(), scheduleId, a.patient_id, a.doctor_id, a.room_id, a.slot_id, a.appointment_num);
            }
        });
        insertAll(aiResult.schedule);

        // 7. Update patient statuses
        const scheduledPatients = [...new Set(aiResult.schedule.map(a => a.patient_id))];
        const updateStatus = db.transaction((ids) => {
            for (const id of ids) {
                db.prepare("UPDATE patients SET status = 'scheduled' WHERE id = ?").run(id);
            }
        });
        updateStatus(scheduledPatients);

        // 8. Create notifications
        const notifInsert = db.prepare('INSERT INTO notifications (id, user_id, title, message) VALUES (?, ?, ?, ?)');
        const notifTx = db.transaction(() => {
            for (const a of aiResult.schedule) {
                // Notify patient
                const pUser = db.prepare('SELECT user_id FROM patients WHERE id = ?').get(a.patient_id);
                const slot = db.prepare('SELECT date, start_time FROM appointment_slots WHERE id = ?').get(a.slot_id);
                if (pUser && slot) {
                    notifInsert.run(uuidv4(), pUser.user_id,
                        'Appointment Scheduled',
                        `Your Appointment #${a.appointment_num} is scheduled on ${slot.date} at ${slot.start_time}.`
                    );
                }

                // Notify doctor
                const dUser = db.prepare('SELECT user_id FROM doctors WHERE id = ?').get(a.doctor_id);
                if (dUser && slot) {
                    notifInsert.run(uuidv4(), dUser.user_id,
                        'New Patient Appointment',
                        `You have a patient appointment on ${slot.date} at ${slot.start_time}.`
                    );
                }
            }
        });
        notifTx();

        res.status(201).json({
            success: true,
            schedule_id: scheduleId,
            name: scheduleName,
            total_appointments: aiResult.schedule.length,
            quality_score: aiResult.quality_score,
            stats: aiResult.stats
        });

    } catch (err) {
        if (err.message.includes('ECONNREFUSED')) {
            return res.status(503).json({ error: 'AI engine is not running. Start it with: python app.py' });
        }
        res.status(500).json({ error: err.message });
    }
});

// GET /api/appointment-schedule
router.get('/', auth(), (req, res) => {
    const schedules = db.prepare('SELECT * FROM appointment_schedules ORDER BY created_at DESC').all();
    res.json(schedules);
});

// GET /api/appointment-schedule/:id
router.get('/:id', auth(), (req, res) => {
    const schedule = db.prepare('SELECT * FROM appointment_schedules WHERE id = ?').get(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Appointment schedule not found' });

    const assignments = db.prepare(`
    SELECT aa.*,
      u_p.name as patient_name, p.medical_condition, p.priority, p.required_appointments,
      u_d.name as doctor_name, d.specialization,
      cr.name as room_name,
      asl.date, asl.start_time, asl.end_time
    FROM appointment_assignments aa
    JOIN patients p ON aa.patient_id = p.id
    JOIN users u_p ON p.user_id = u_p.id
    JOIN doctors d ON aa.doctor_id = d.id
    JOIN users u_d ON d.user_id = u_d.id
    JOIN consultation_rooms cr ON aa.consultation_room_id = cr.id
    JOIN appointment_slots asl ON aa.appointment_slot_id = asl.id
    WHERE aa.schedule_id = ?
    ORDER BY asl.date, asl.start_time
  `).all(req.params.id);

    res.json({ ...schedule, assignments });
});

// GET /api/appointment-schedule/me/assignments  (patient/doctor sees own appointments)
router.get('/me/assignments', auth(['patient', 'doctor']), (req, res) => {
    let profileId;
    if (req.user.role === 'patient') {
        const p = db.prepare('SELECT id FROM patients WHERE user_id = ?').get(req.user.id);
        if (!p) return res.json([]);
        profileId = p.id;

        const assignments = db.prepare(`
      SELECT aa.*, s.name as schedule_name,
        u_d.name as doctor_name, d.specialization,
        cr.name as room_name,
        asl.date, asl.start_time, asl.end_time
      FROM appointment_assignments aa
      JOIN appointment_schedules s ON aa.schedule_id = s.id
      JOIN doctors d ON aa.doctor_id = d.id
      JOIN users u_d ON d.user_id = u_d.id
      JOIN consultation_rooms cr ON aa.consultation_room_id = cr.id
      JOIN appointment_slots asl ON aa.appointment_slot_id = asl.id
      WHERE aa.patient_id = ? ORDER BY asl.date, asl.start_time
    `).all(profileId);
        return res.json(assignments);
    }

    if (req.user.role === 'doctor') {
        const d = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
        if (!d) return res.json([]);
        profileId = d.id;

        const assignments = db.prepare(`
      SELECT aa.*, s.name as schedule_name,
        u_p.name as patient_name, p.medical_condition,
        cr.name as room_name,
        asl.date, asl.start_time, asl.end_time
      FROM appointment_assignments aa
      JOIN appointment_schedules s ON aa.schedule_id = s.id
      JOIN patients p ON aa.patient_id = p.id
      JOIN users u_p ON p.user_id = u_p.id
      JOIN consultation_rooms cr ON aa.consultation_room_id = cr.id
      JOIN appointment_slots asl ON aa.appointment_slot_id = asl.id
      WHERE aa.doctor_id = ? ORDER BY asl.date, asl.start_time
    `).all(profileId);
        return res.json(assignments);
    }
});

// DELETE /api/appointment-schedule/:id
router.delete('/:id', auth(['admin']), (req, res) => {
    db.prepare('DELETE FROM appointment_schedules WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
