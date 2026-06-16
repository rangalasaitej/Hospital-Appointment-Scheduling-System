require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// Routes - Hospital Appointment Scheduling System
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/consultation-rooms', require('./routes/consultation-rooms'));
app.use('/api/appointment-slots', require('./routes/appointment-slots'));
app.use('/api/constraints', require('./routes/constraints'));
app.use('/api/appointment-schedule', require('./routes/appointment-schedule'));
app.use('/api/notifications', require('./routes/notifications'));

// Hospital stats endpoint for admin dashboard
app.get('/api/stats', require('./middleware/auth')(['admin', 'receptionist']), (req, res) => {
  const db = require('./db/db');
  const totalPatients = db.prepare('SELECT COUNT(*) as c FROM patients').get().c;
  const scheduledPatients = db.prepare("SELECT COUNT(*) as c FROM patients WHERE status='scheduled'").get().c;
  const totalDoctors = db.prepare('SELECT COUNT(*) as c FROM doctors').get().c;
  const totalRooms = db.prepare('SELECT COUNT(*) as c FROM consultation_rooms WHERE is_active=1').get().c;
  const availableSlots = db.prepare('SELECT COUNT(*) as c FROM appointment_slots WHERE is_break=0').get().c;
  const totalSchedules = db.prepare('SELECT COUNT(*) as c FROM appointment_schedules').get().c;
  const recentSchedules = db.prepare('SELECT * FROM appointment_schedules ORDER BY created_at DESC LIMIT 5').all();

  res.json({
    totalPatients,
    scheduledPatients,
    pendingPatients: totalPatients - scheduledPatients,
    totalDoctors,
    totalConsultationRooms: totalRooms,
    availableAppointmentSlots: availableSlots,
    totalAppointmentSchedules: totalSchedules,
    recentSchedules
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Hospital Appointment Scheduling System API' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Hospital Appointment Scheduling API running on http://localhost:${PORT}`);
});
