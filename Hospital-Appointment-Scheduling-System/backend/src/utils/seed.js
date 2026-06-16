/**
 * Seed script: Creates demo users, patients, doctors, consultation rooms, appointment slots, and constraints.
 * Hospital Appointment Scheduling System using CSP
 * Run: node src/utils/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');

async function seed() {
  console.log('🌱 Seeding Hospital Appointment Scheduling database...');

  // ── USERS ───────────────────────────────────────────────────────────────────
  const users = [
    { name: 'Admin User', email: 'admin@hospital.com', password: 'admin123', role: 'admin' },
    { name: 'Receptionist Manager', email: 'receptionist@hospital.com', password: 'reception1', role: 'receptionist' },
    { name: 'Dr. Priya Sharma', email: 'priya@hospital.com', password: 'pass123', role: 'doctor' },
    { name: 'Dr. Raj Kumar', email: 'raj@hospital.com', password: 'pass123', role: 'doctor' },
    { name: 'Dr. Aisha Patel', email: 'aisha@hospital.com', password: 'pass123', role: 'doctor' },
    { name: 'Alice Johnson', email: 'alice@patient.com', password: 'pass123', role: 'patient' },
    { name: 'Bob Williams', email: 'bob@patient.com', password: 'pass123', role: 'patient' },
    { name: 'Carol Davis', email: 'carol@patient.com', password: 'pass123', role: 'patient' },
    { name: 'David Lee', email: 'david@patient.com', password: 'pass123', role: 'patient' },
  ];

  const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
  const insertPatient = db.prepare('INSERT OR IGNORE INTO patients (id, user_id, medical_condition, age, priority, required_appointments) VALUES (?, ?, ?, ?, ?, ?)');
  const insertDoctor = db.prepare('INSERT OR IGNORE INTO doctors (id, user_id, specialization, certifications, max_patients_per_day) VALUES (?, ?, ?, ?, ?)');

  const userIds = {};
  const patientIds = {};
  const doctorIds = {};

  for (const u of users) {
    const hashed = bcrypt.hashSync(u.password, 10);
    const uid = uuidv4();
    userIds[u.email] = uid;
    insertUser.run(uid, u.name, u.email, hashed, u.role);
  }

  // Patients
  const patientData = [
    { email: 'alice@patient.com', condition: 'Hypertension', age: 45, priority: 1, appointments: 2 },
    { email: 'bob@patient.com', condition: 'Diabetes Type 2', age: 38, priority: 2, appointments: 1 },
    { email: 'carol@patient.com', condition: 'Cardiovascular Disease', age: 62, priority: 3, appointments: 2 },
    { email: 'david@patient.com', condition: 'General Checkup', age: 28, priority: 4, appointments: 1 },
  ];
  for (const pd of patientData) {
    const pid = uuidv4();
    patientIds[pd.email] = pid;
    insertPatient.run(pid, userIds[pd.email], pd.condition, pd.age, pd.priority, pd.appointments);
  }

  // Doctors with specializations
  const doctorData = [
    { email: 'priya@hospital.com', spec: 'Cardiology', certs: ['MD - Cardiology', 'Fellowship - American Heart Association'], max: 4 },
    { email: 'raj@hospital.com', spec: 'Endocrinology', certs: ['MD - Endocrinology', 'Diabetes Management Certificate'], max: 5 },
    { email: 'aisha@hospital.com', spec: 'General Medicine', certs: ['MD - General Medicine', 'Internal Medicine'], max: 6 },
  ];
  for (const dd of doctorData) {
    const did = uuidv4();
    doctorIds[dd.email] = did;
    insertDoctor.run(did, userIds[dd.email], dd.spec, JSON.stringify(dd.certs), dd.max);
  }

  // ── CONSULTATION ROOMS ────────────────────────────────────────────────────────
  const rooms = [
    { name: 'Consultation Room A', type: 'General', equipment: ['BP Monitor', 'ECG Machine'] },
    { name: 'Consultation Room B', type: 'Cardiology', equipment: ['Echocardiography', 'Holter Monitor'] },
    { name: 'Consultation Room C', type: 'General', equipment: ['Glucometer', 'Weighing Scale'] },
  ];
  const insertRoom = db.prepare('INSERT OR IGNORE INTO consultation_rooms (id, name, room_type, equipment) VALUES (?, ?, ?, ?)');
  const roomIds = {};
  for (const r of rooms) {
    const rid = uuidv4();
    roomIds[r.name] = rid;
    insertRoom.run(rid, r.name, r.type, JSON.stringify(r.equipment));
  }

  // ── APPOINTMENT SLOTS ───────────────────────────────────────────────────────────
  const dates = ['2025-07-01', '2025-07-02', '2025-07-03'];
  const times = [
    { start: '09:00', end: '09:30', isBreak: false },
    { start: '09:30', end: '10:00', isBreak: false },
    { start: '10:00', end: '10:30', isBreak: false },
    { start: '10:30', end: '11:00', isBreak: false },
    { start: '11:00', end: '11:30', isBreak: false },
    { start: '11:30', end: '12:00', isBreak: false },
    { start: '12:00', end: '13:00', isBreak: true },  // Lunch break
    { start: '13:00', end: '13:30', isBreak: false },
    { start: '13:30', end: '14:00', isBreak: false },
    { start: '14:00', end: '14:30', isBreak: false },
    { start: '14:30', end: '15:00', isBreak: false },
    { start: '15:00', end: '15:30', isBreak: false },
    { start: '15:30', end: '16:00', isBreak: false },
    { start: '16:00', end: '16:30', isBreak: false },
    { start: '16:30', end: '17:00', isBreak: false },
  ];

  const insertSlot = db.prepare('INSERT OR IGNORE INTO appointment_slots (id, date, start_time, end_time, duration, is_break) VALUES (?, ?, ?, ?, 30, ?)');
  const slotIds = {}; // date_startTime → id

  for (const date of dates) {
    for (const t of times) {
      const sid = uuidv4();
      const key = `${date}_${t.start}`;
      slotIds[key] = sid;
      insertSlot.run(sid, date, t.start, t.end, t.isBreak ? 1 : 0);
    }
  }

  // ── AVAILABILITY ─────────────────────────────────────────────────────────────
  // All patients available all non-break slots on all 3 days
  const availSlots = Object.entries(slotIds).filter(([k]) => !k.includes('12:00')).map(([, v]) => v);

  const insertPatientAvail = db.prepare('INSERT OR IGNORE INTO patient_availability (id, patient_id, appointment_slot_id) VALUES (?, ?, ?)');
  const insertDoctorAvail = db.prepare('INSERT OR IGNORE INTO doctor_availability (id, doctor_id, appointment_slot_id) VALUES (?, ?, ?)');

  for (const pid of Object.values(patientIds)) {
    for (const sid of availSlots) insertPatientAvail.run(uuidv4(), pid, sid);
  }

  // Doctors have partial availability
  const doctorAvailMap = {
    'priya@hospital.com': availSlots.slice(0, 28),  // Available first 2 days
    'raj@hospital.com': availSlots.slice(14, 42),   // Available middle and last day
    'aisha@hospital.com': availSlots,               // Available all slots
  };
  for (const [email, slots] of Object.entries(doctorAvailMap)) {
    const did = doctorIds[email];
    for (const sid of slots) insertDoctorAvail.run(uuidv4(), did, sid);
  }

  // ── DEFAULT CONSTRAINTS ──────────────────────────────────────────────────────
  const insertConstraint = db.prepare('INSERT OR IGNORE INTO constraints_config (id, type, category, label, value) VALUES (?, ?, ?, ?, ?)');
  const defaultConstraints = [
    { type: 'hard', cat: 'no_overlap', label: 'No doctor double booking', value: 'true' },
    { type: 'hard', cat: 'no_room_conflict', label: 'No consultation room double booking', value: 'true' },
    { type: 'hard', cat: 'patient_availability', label: 'Respect patient availability', value: 'true' },
    { type: 'hard', cat: 'doctor_availability', label: 'Respect doctor availability', value: 'true' },
    { type: 'soft', cat: 'min_gap', label: 'Min gap between appointments (slots)', value: '1' },
    { type: 'soft', cat: 'max_per_day', label: 'Max appointments per doctor per day', value: '5' },
    { type: 'soft', cat: 'priority_morning', label: 'High priority patients get morning slots', value: 'true' },
    { type: 'soft', cat: 'specialization_match', label: 'Prefer specialization match for treatment', value: 'true' },
  ];
  for (const c of defaultConstraints) {
    insertConstraint.run(uuidv4(), c.type, c.cat, c.label, c.value);
  }

  console.log('✅ Hospital appointment scheduling database seed complete!');
  console.log('\n📋 Demo Login Credentials:');
  console.log('  Admin:       admin@hospital.com / admin123');
  console.log('  Receptionist: receptionist@hospital.com / reception1');
  console.log('  Doctor:      priya@hospital.com / pass123');
  console.log('  Patient:     alice@patient.com / pass123');
}

seed().catch(console.error);
