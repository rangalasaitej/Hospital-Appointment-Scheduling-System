# 🏥 Hospital Appointment Scheduling System

An AI-powered **Hospital Appointment Scheduling System** using **Constraint Satisfaction Problems (CSP)** with advanced algorithms including Backtracking, MRV (Minimum Remaining Values), LCV (Least Constraining Value), Forward Checking, AC-3 (Arc Consistency), and Hill Climbing optimization.

## Overview

This system automates the complex task of scheduling patient appointments with doctors in a hospital environment, respecting doctor availability, patient preferences, room constraints, and medical specialization requirements.

### Key Features
- **AI-Powered Scheduling**: CSP-based optimization for optimal appointment allocation
- **Multi-Doctor Support**: Multiple doctors with different specializations
- **Patient Management**: Track patients and their medical conditions
- **Consultation Room Allocation**: Assign rooms with appropriate equipment
- **Constraint Management**: Enforce hard and soft constraints for real-world scenarios
- **Real-time Dashboard**: Monitor appointments, doctors, patients, and rooms
- **Doctor Availability**: Respect doctor schedules and specialization expertise
- **Patient Priority**: Prioritize high-priority patients for earlier slots

## Architecture

Hospital Appointment Scheduling System using CSP

Technologies:
- React
- Node.js
- Python Flask
- SQLite

Features:
- Patient Management
- Doctor Management
- Appointment Slot Generation
- CSP-Based Scheduling
- Analytics Dashboard

Algorithms:
- AC-3
- MRV
- LCV
- Forward Checking
- Backtracking
- Hill Climbing

GitHub:
https://github.com/chandu235363/Hospital-Appointment-Scheduling-System

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 18 + Vite | Modern UI/UX for scheduling interface |
| **Backend** | Node.js + Express + SQLite | RESTful API & data persistence |
| **AI Engine** | Python Flask + CSP Solver | Constraint satisfaction & optimization |
| **Database** | SQLite | Lightweight relational database |
| **Algorithms** | Backtracking, MRV, LCV, Forward Checking, AC-3 | Constraint satisfaction techniques |

## Domain Entities (Hospital Terminology)

| Old Term | New Term | Description |
|----------|----------|-------------|
| Candidate | **Patient** | Individual seeking medical appointments |
| Interviewer | **Doctor** | Healthcare professional providing consultations |
| Interview Room | **Consultation Room** | Medically equipped space for appointments |
| Interview Slot | **Appointment Slot** | 30-minute time block for appointments |
| Interview Schedule | **Appointment Schedule** | Generated timetable of appointments |
| Interview Round | **Appointment Number** | Which appointment (1st, 2nd, etc.) |

## CSP Constraints

### Hard Constraints (Must be satisfied)
- ✅ **No Doctor Double Booking**: A doctor cannot have overlapping appointments
- ✅ **No Room Conflict**: A consultation room cannot be assigned to multiple appointments simultaneously  
- ✅ **Patient Availability**: Respect patient availability windows
- ✅ **Doctor Availability**: Respect doctor availability and working hours
- ✅ **Room Equipment Match**: Ensure room has required medical equipment

### Soft Constraints (Optimization preferences)
- 🎯 **Priority Scheduling**: High-priority patients get morning slots
- 🎯 **Minimum Gap**: Maintain minimum gap between consecutive appointments (1 slot)
- 🎯 **Doctor Capacity**: Respect maximum patients per doctor per day (typically 5-6)
- 🎯 **Specialization Match**: Prefer doctors with relevant expertise for medical conditions
- 🎯 **Room Type Preference**: Assign appropriate room type based on appointment type

## Quick Start

### Prerequisites
- **Node.js** 16+
- **Python** 3.8+
- **SQLite** (included in Node.js)

### Step 1: Install Dependencies

#### AI Engine (Python)
```bash
# On Ubuntu/Debian:
sudo apt install python3-pip
pip3 install flask flask-cors python-dotenv

# OR via conda:
conda install flask flask-cors python-dotenv

# OR via pip:
pip install -r ai-engine/requirements.txt
```

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### Step 2: Setup Database

```bash
cd backend
node src/utils/seed.js
```

**Demo Credentials:**
```
Admin:       admin@hospital.com / admin123
Receptionist: receptionist@hospital.com / reception1
Doctor:      priya@hospital.com / pass123
Patient:     alice@patient.com / pass123
```

### Step 3: Start All Services (3 separate terminals)

**Terminal 1 — AI Engine (Python CSP Solver):**
```bash
cd ai-engine
python3 app.py
```
Expected output:
```
 * Running on http://localhost:5001
```

**Terminal 2 — Backend (Node.js API):**
```bash
cd backend
npm run dev
```
Expected output:
```
🚀 Hospital Appointment Scheduling API running on http://localhost:3001
```

**Terminal 3 — Frontend (React + Vite):**
```bash
cd frontend
npm run dev
```
Expected output:
```
  ➜ Local: http://localhost:5173/
```

### Step 4: Access the System

Open your browser and navigate to:
```
http://localhost:5173
```

Login with demo credentials above.

## Using the System

### For Administrators/Receptionists

1. **Add Patients**
   - Navigate to **Patients** section
   - Click **Add Patient**
   - Fill in medical condition, age, and priority

2. **Add Doctors**
   - Navigate to **Doctors** section
   - View registered doctors with their specializations
   - Edit doctor details and certifications

3. **Configure Consultation Rooms**
   - Navigate to **Consultation Rooms**
   - Add rooms with appropriate medical equipment
   - Specify room type (General, Cardiology, etc.)

4. **Generate Appointment Slots**
   - Navigate to **Appointment Slots**
   - Generate slots for date ranges
   - Set appointment duration (typically 30 minutes)

5. **Generate Appointment Schedule**
   - Click **Generate Schedule** button
   - AI engine optimizes appointments using CSP
   - View quality score, solve time, and backtrack count

### For Doctors

- View assigned appointments in **My Schedule**
- Set availability windows for scheduling
- View patient medical conditions

### For Patients

- View scheduled appointments in **My Appointments**
- Set availability for appointments
- Receive notifications when appointments are scheduled

## API Endpoints

### Authentication
```
POST   /api/auth/register        Register new user
POST   /api/auth/login           Login & get JWT token
GET    /api/auth/me              Get current user profile
```

### Patients
```
GET    /api/patients             List all patients (admin/receptionist)
POST   /api/patients             Create patient
GET    /api/patients/:id         Get patient details
PUT    /api/patients/:id         Update patient
DELETE /api/patients/:id         Delete patient
```

### Doctors
```
GET    /api/doctors              List all doctors
GET    /api/doctors/:id          Get doctor details
PUT    /api/doctors/:id          Update doctor profile
PUT    /api/doctors/:id/availability   Set doctor availability
```

### Consultation Rooms
```
GET    /api/consultation-rooms   List all rooms
POST   /api/consultation-rooms   Create room
PUT    /api/consultation-rooms/:id     Update room
DELETE /api/consultation-rooms/:id     Deactivate room
```

### Appointment Slots
```
GET    /api/appointment-slots    List all slots
POST   /api/appointment-slots    Create single slot
POST   /api/appointment-slots/generate   Bulk generate slots
DELETE /api/appointment-slots/:id        Delete slot
```

### Appointment Scheduling
```
GET    /api/appointment-schedule              List all schedules
POST   /api/appointment-schedule/generate     Generate new schedule (CSP solver)
GET    /api/appointment-schedule/:id          Get schedule details
GET    /api/appointment-schedule/me/assignments   Get user's appointments
DELETE /api/appointment-schedule/:id          Delete schedule
```

### Admin Stats
```
GET    /api/stats                Dashboard statistics
```

## Database Schema

### Tables (Hospital Context)

- **users** - Hospital staff and patients
- **patients** - Patient medical profiles
- **patient_availability** - Patient availability windows
- **doctors** - Doctor profiles with specializations
- **doctor_availability** - Doctor available time slots
- **consultation_rooms** - Medical consultation rooms
- **appointment_slots** - Time blocks for appointments
- **appointment_schedules** - Generated appointment schedules
- **appointment_assignments** - Final patient-doctor-room-time mappings
- **constraints_config** - Scheduling rules & preferences
- **notifications** - System notifications for users

## CSP Algorithm Details

### Solver Approach

The AI engine uses a **backtracking search with constraint propagation**:

1. **Variable Selection**: Minimum Remaining Values (MRV) heuristic
   - Selects most constrained patient first
   
2. **Value Ordering**: Least Constraining Value (LCV) heuristic
   - Orders appointment slots by least impact on remaining slots

3. **Constraint Checking**: Forward Checking & Arc Consistency (AC-3)
   - Prunes domain of future variables
   - Detects failures early

4. **Optimization**: Hill Climbing for soft constraint optimization
   - Improves solution quality (soft constraint satisfaction)
   - Balances scheduling fairness

### Performance Metrics

Generated schedules include:
- **Quality Score**: Percentage of soft constraints satisfied (0-100%)
- **Backtracks**: Number of backtracking steps taken
- **Solve Time**: Milliseconds to find solution

## Configuration

### Environment Variables

**Backend (.env)**
```
PORT=3001
JWT_SECRET=hospital_scheduler_secret_2024
AI_ENGINE_URL=http://localhost:5001/api
```

**AI Engine (.env)**
```
FLASK_PORT=5001
DEBUG=True
```

## Troubleshooting

### "AI engine is not running"
```bash
# Ensure Python Flask is running:
cd ai-engine && python3 app.py
```

### "No pending patients found"
```bash
# Add patients via Admin Dashboard > Patients
# Register a patient account at /register
```

### Database locked errors
```bash
# Delete old database and reseed:
cd backend
rm data/scheduler.db
node src/utils/seed.js
```

### Port conflicts
```bash
# Modify ports in:
# Frontend: vite.config.js
# Backend: .env (PORT=3001)
# AI Engine: .env (FLASK_PORT=5001)
```

## Project Structure

```
Hospital Appointment Scheduling System/
├── frontend/                          # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx      # Hospital dashboard
│   │   │   │   ├── Patients.jsx            # Patient management
│   │   │   │   ├── Doctors.jsx             # Doctor management
│   │   │   │   ├── ConsultationRooms.jsx   # Room management
│   │   │   │   ├── AppointmentSlots.jsx    # Slot management
│   │   │   │   └── GenerateSchedule.jsx    # Schedule generation
│   │   │   ├── doctor/                     # Doctor dashboards
│   │   │   ├── patient/                    # Patient dashboards
│   │   │   └── auth/                       # Login/Register
│   │   ├── components/                     # Reusable components
│   │   ├── context/                        # React context
│   │   └── services/                       # API calls
│   └── package.json
│
├── backend/                           # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js                     # Authentication
│   │   │   ├── patients.js                 # Patient endpoints
│   │   │   ├── doctors.js                  # Doctor endpoints
│   │   │   ├── consultation-rooms.js       # Room endpoints
│   │   │   ├── appointment-slots.js        # Slot endpoints
│   │   │   ├── appointment-schedule.js     # Schedule generation
│   │   │   └── notifications.js            # Notifications
│   │   ├── db/
│   │   │   ├── db.js                       # Database connection
│   │   │   └── schema.sql                  # Database schema
│   │   ├── middleware/                     # Auth middleware
│   │   ├── utils/
│   │   │   └── seed.js                     # Database seeding
│   │   └── app.js                          # Express app
│   └── package.json
│
├── ai-engine/                         # Python CSP Solver
│   ├── app.py                              # Flask API
│   ├── csp/
│   │   ├── solver.py                       # Main CSP solver
│   │   ├── optimizer.py                    # CSP optimizer
│   │   ├── constraints.py                  # Constraint definitions
│   │   ├── heuristics.py                   # Heuristic functions
│   │   └── __init__.py
│   ├── api/
│   │   ├── routes.py                       # API endpoints
│   │   └── __init__.py
│   ├── requirements.txt                    # Python dependencies
│   └── .env
│
└── README.md                          # This file
```

## Algorithms Explained

### Constraint Satisfaction Problem (CSP)

A CSP consists of:
- **Variables**: Appointments to schedule
- **Domains**: Possible (doctor, room, slot, patient) combinations
- **Constraints**: Hard and soft rules

### Minimum Remaining Values (MRV)

Chooses the variable with the smallest remaining domain first:
```
Select patient with fewest available appointment slots
→ Fails faster on infeasible problems
→ Reduces search space dramatically
```

### Least Constraining Value (LCV)

Among values, selects the one that leaves most options for others:
```
Among available doctor-room-slot combinations,
choose one that eliminates fewest options for other patients
```

### Arc Consistency (AC-3)

Ensures every value in a variable's domain is consistent with neighbors:
```
If no value for X is compatible with Y,
remove X from consideration early
```

### Forward Checking

After assigning a value, eliminates incompatible values from neighbors' domains:
```
Detect conflicts earlier than backtracking
Prune large portions of search tree
```

## Performance Characteristics

- **Best Case**: O(n) - All constraints satisfied trivially
- **Average Case**: O(n^k) - Polynomial with heuristics
- **Worst Case**: O(d^n) - Exponential without pruning

With CSP optimizations:
- **Typical solve time**: 50-500ms for 10+ appointments
- **Quality score**: 85-100% soft constraint satisfaction
- **Backtrack count**: < 50 for optimal solutions

## Future Enhancements

- [ ] Multi-hospital support with resource sharing
- [ ] Doctor break time management
- [ ] Emergency appointment slots
- [ ] Appointment rescheduling workflow
- [ ] Patient health records integration
- [ ] SMS/Email notifications
- [ ] Mobile app for patients
- [ ] Advanced reporting & analytics
- [ ] Machine learning for prediction
- [ ] Genetic algorithm optimization

## Contributing

This is a demonstration project. To contribute improvements:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - Educational & Commercial Use

## Support

For issues or questions:
- Check troubleshooting section above
- Review code comments
- Check backend logs for API errors
- Verify all 3 services are running

---

**Built with ❤️ for hospital scheduling optimization**

Open: **http://localhost:5173**

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@scheduler.com | admin123 |
| HR | hr@scheduler.com | hr1234 |
| Interviewer | priya@scheduler.com | pass123 |
| Candidate | alice@candidate.com | pass123 |

## How to Use (Admin Flow)

1. **Login** as Admin
2. Check **Candidates** and **Interviewers** (pre-seeded)
3. Go to **Time Slots** → Generate slots for date range
4. Go to **Generate Schedule** → Click "Generate Schedule"
5. The AI engine runs CSP → Go to **View Schedule** to see results
6. Candidates/Interviewers can login to see their assignments

## AI Algorithm

```
Input → AC-3 (domain reduction)
      → Backtracking Search
        → MRV (pick variable with fewest options)
        → LCV (pick value that blocks others least)
        → Forward Checking (prune on assignment)
      → Hill Climbing (optimize soft constraints)
      → Final Schedule
```

## Project Structure

```
Cfai/
├── ai-engine/
│   ├── app.py              ← Flask entry point
│   ├── csp/
│   │   ├── solver.py       ← Backtracking + MRV + LCV + FC
│   │   ├── constraints.py  ← Hard & soft constraint functions
│   │   ├── heuristics.py   ← MRV, LCV, AC-3
│   │   └── optimizer.py    ← Hill climbing
│   └── api/routes.py       ← /solve, /validate endpoints
├── backend/
│   ├── src/
│   │   ├── app.js          ← Express entry point
│   │   ├── db/             ← SQLite schema + connection
│   │   ├── routes/         ← All API routes
│   │   ├── middleware/     ← JWT auth
│   │   └── utils/seed.js   ← Demo data seeder
│   └── data/scheduler.db   ← SQLite database (auto-created)
└── frontend/
    └── src/
        ├── pages/
        │   ├── auth/       ← Login, Register
        │   ├── admin/      ← Dashboard, Candidates, Interviewers, Rooms, Slots, Constraints, Schedule
        │   ├── interviewer/← Dashboard, Schedule, Availability
        │   └── candidate/  ← Dashboard, Interviews, Availability
        ├── components/     ← Shared components
        ├── context/        ← Auth context
        └── services/       ← Axios API client
```
