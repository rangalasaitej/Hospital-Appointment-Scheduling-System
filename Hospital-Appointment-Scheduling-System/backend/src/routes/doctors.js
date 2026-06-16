const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const auth = require('../middleware/auth');

// GET /api/doctors
router.get('/', auth(), (req, res) => {
    const doctors = db.prepare(`
    SELECT d.*, u.name, u.email FROM doctors d JOIN users u ON d.user_id = u.id
    ORDER BY d.created_at DESC
  `).all();

    const result = doctors.map(d => {
        const avail = db.prepare('SELECT appointment_slot_id FROM doctor_availability WHERE doctor_id = ?').all(d.id);
        return { ...d, availability: avail.map(a => a.appointment_slot_id), certifications: JSON.parse(d.certifications || '[]') };
    });

    res.json(result);
});

// GET /api/doctors/me/profile
router.get('/me/profile', auth(['doctor']), (req, res) => {
    const d = db.prepare(`
    SELECT d.*, u.name, u.email FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.id = ?
  `).get(req.user.id);
    if (!d) return res.status(404).json({ error: 'Profile not found' });

    const avail = db.prepare('SELECT appointment_slot_id FROM doctor_availability WHERE doctor_id = ?').all(d.id);
    res.json({ ...d, availability: avail.map(a => a.appointment_slot_id), certifications: JSON.parse(d.certifications || '[]') });
});

// GET /api/doctors/:id
router.get('/:id', auth(), (req, res) => {
    const d = db.prepare(`
    SELECT d.*, u.name, u.email FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ?
  `).get(req.params.id);
    if (!d) return res.status(404).json({ error: 'Not found' });

    const avail = db.prepare('SELECT appointment_slot_id FROM doctor_availability WHERE doctor_id = ?').all(d.id);
    res.json({ ...d, availability: avail.map(a => a.appointment_slot_id), certifications: JSON.parse(d.certifications || '[]') });
});

// PUT /api/doctors/:id
router.put('/:id', auth(['admin', 'receptionist', 'doctor']), (req, res) => {
    const { specialization, certifications, max_patients_per_day } = req.body;
    db.prepare(`UPDATE doctors SET specialization=?, certifications=?, max_patients_per_day=? WHERE id=?`)
        .run(specialization, JSON.stringify(certifications || []), max_patients_per_day || 5, req.params.id);
    res.json({ success: true });
});

// PUT /api/doctors/:id/availability
router.put('/:id/availability', auth(), (req, res) => {
    const { appointment_slot_ids } = req.body;
    if (!Array.isArray(appointment_slot_ids)) return res.status(400).json({ error: 'appointment_slot_ids must be array' });

    const doctorId = req.params.id;
    db.prepare('DELETE FROM doctor_availability WHERE doctor_id = ?').run(doctorId);

    const insert = db.prepare('INSERT INTO doctor_availability (id, doctor_id, appointment_slot_id) VALUES (?, ?, ?)');
    const insertMany = db.transaction((ids) => {
        for (const slotId of ids) insert.run(uuidv4(), doctorId, slotId);
    });
    insertMany(appointment_slot_ids);

    res.json({ success: true, count: appointment_slot_ids.length });
});

module.exports = router;
