-- Hospital Appointment Scheduling System — SQLite Schema
-- Uses Constraint Satisfaction Problems (CSP) for optimal scheduling

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin','receptionist','doctor','patient')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medical_condition TEXT,
  age INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 5,
  required_appointments INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','scheduled','completed','cancelled')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patient_availability (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_slot_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT,
  certifications TEXT DEFAULT '[]',
  max_patients_per_day INTEGER DEFAULT 5,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS doctor_availability (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_slot_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS consultation_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  room_type TEXT DEFAULT 'General',
  equipment TEXT DEFAULT '[]',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointment_slots (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration INTEGER DEFAULT 30,
  is_break INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS constraints_config (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('hard','soft')),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointment_schedules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft','confirmed','completed')),
  quality_score REAL DEFAULT 0,
  backtracks INTEGER DEFAULT 0,
  solve_time_ms INTEGER DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointment_assignments (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL REFERENCES appointment_schedules(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  doctor_id TEXT NOT NULL REFERENCES doctors(id),
  consultation_room_id TEXT NOT NULL REFERENCES consultation_rooms(id),
  appointment_slot_id TEXT NOT NULL REFERENCES appointment_slots(id),
  appointment_num INTEGER DEFAULT 1,
  status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed','cancelled','rescheduled')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
