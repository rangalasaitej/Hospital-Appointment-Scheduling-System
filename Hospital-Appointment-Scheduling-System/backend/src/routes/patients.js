const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const auth = require('../middleware/auth');

// GET /api/patients
router.get('/', auth(['admin', 'receptionist']), (req, res) => {
    const patients = db.prepare(`
    SELECT p.*, u.name, u.email, u.role
    FROM patients p JOIN users u ON p.user_id = u.id
    ORDER BY p.priority ASC, p.created_at DESC
  `).all();

    // Add availability slot IDs
    const result = patients.map(p => {
        const avail = db.prepare('SELECT appointment_slot_id FROM patient_availability WHERE patient_id = ?').all(p.id);
        return { ...p, availability: avail.map(a => a.appointment_slot_id) };
    });

    res.json(result);
});

// GET /api/patients/:id
router.get('/:id', auth(), (req, res) => {
    const p = db.prepare(`
    SELECT p.*, u.name, u.email FROM patients p JOIN users u ON p.user_id = u.id WHERE p.id = ?
  `).get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Patient not found' });

    const avail = db.prepare('SELECT appointment_slot_id FROM patient_availability WHERE patient_id = ?').all(p.id);
    res.json({ ...p, availability: avail.map(a => a.appointment_slot_id) });
});

// GET /api/patients/me/profile  (patient sees own profile)
router.get('/me/profile', auth(['patient']), (req, res) => {
    const p = db.prepare(`
    SELECT p.*, u.name, u.email FROM patients p JOIN users u ON p.user_id = u.id WHERE u.id = ?
  `).get(req.user.id);
    if (!p) return res.status(404).json({ error: 'Profile not found' });

    const avail = db.prepare('SELECT appointment_slot_id FROM patient_availability WHERE patient_id = ?').all(p.id);
    res.json({ ...p, availability: avail.map(a => a.appointment_slot_id) });
});

// PUT /api/patients/:id
router.put('/:id', auth(['admin', 'receptionist']), (req, res) => {
    const { medical_condition, age, priority, required_appointments, status } = req.body;
    db.prepare(`
    UPDATE patients SET medical_condition=?, age=?, priority=?, required_appointments=?, status=? WHERE id=?
  `).run(medical_condition, age, priority, required_appointments, status, req.params.id);
    res.json({ success: true });
});

// PUT /api/patients/:id/availability
router.put('/:id/availability', auth(), (req, res) => {
    const { appointment_slot_ids } = req.body; // array of slot IDs
    if (!Array.isArray(appointment_slot_ids)) return res.status(400).json({ error: 'appointment_slot_ids must be array' });

    const patientId = req.params.id;
    db.prepare('DELETE FROM patient_availability WHERE patient_id = ?').run(patientId);

    const insert = db.prepare('INSERT INTO patient_availability (id, patient_id, appointment_slot_id) VALUES (?, ?, ?)');
    const insertMany = db.transaction((ids) => {
        for (const slotId of ids) insert.run(uuidv4(), patientId, slotId);
    });
    insertMany(appointment_slot_ids);

    res.json({ success: true, count: appointment_slot_ids.length });
});

// DELETE /api/patients/:id
router.delete('/:id', auth(['admin']), (req, res) => {
    db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
