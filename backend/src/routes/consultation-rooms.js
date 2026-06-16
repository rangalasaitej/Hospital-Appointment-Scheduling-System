const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const auth = require('../middleware/auth');

// GET /api/consultation-rooms
router.get('/', auth(), (req, res) => {
    const rooms = db.prepare('SELECT * FROM consultation_rooms WHERE is_active = 1 ORDER BY name').all();
    res.json(rooms.map(r => ({ ...r, equipment: JSON.parse(r.equipment || '[]') })));
});

// POST /api/consultation-rooms
router.post('/', auth(['admin']), (req, res) => {
    const { name, room_type, equipment } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name required' });

    const existing = db.prepare('SELECT id FROM consultation_rooms WHERE name = ?').get(name);
    if (existing) return res.status(409).json({ error: 'Room name already exists' });

    const id = uuidv4();
    db.prepare('INSERT INTO consultation_rooms (id, name, room_type, equipment) VALUES (?, ?, ?, ?)')
        .run(id, name, room_type || 'General', JSON.stringify(equipment || []));
    res.status(201).json({ id, name, room_type, equipment });
});

// PUT /api/consultation-rooms/:id
router.put('/:id', auth(['admin']), (req, res) => {
    const { name, room_type, equipment, is_active } = req.body;
    db.prepare('UPDATE consultation_rooms SET name=?, room_type=?, equipment=?, is_active=? WHERE id=?')
        .run(name, room_type, JSON.stringify(equipment || []), is_active ?? 1, req.params.id);
    res.json({ success: true });
});

// DELETE /api/consultation-rooms/:id
router.delete('/:id', auth(['admin']), (req, res) => {
    db.prepare('UPDATE consultation_rooms SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

module.exports = router;
