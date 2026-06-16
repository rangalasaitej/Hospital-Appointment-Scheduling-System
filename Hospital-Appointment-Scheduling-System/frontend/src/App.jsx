import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import Patients from './pages/admin/Patients';
import Doctors from './pages/admin/Doctors';
import ConsultationRooms from './pages/admin/Rooms';
import AppointmentSlots from './pages/admin/Slots';
import Constraints from './pages/admin/Constraints';
import GenerateSchedule from './pages/admin/GenerateSchedule';
import Schedule from './pages/admin/Schedule';

// Doctor (using interviewer folder)
import DoctorDashboard from './pages/interviewer/InterviewerDashboard';
import DoctorSchedule from './pages/interviewer/MySchedule';
import DoctorAvailability from './pages/interviewer/Availability';

// Patient (using candidate folder)
import PatientDashboard from './pages/candidate/CandidateDashboard';
import PatientAppointments from './pages/candidate/MyInterviews';
import PatientAvailability from './pages/candidate/Availability';

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'patient') return <Navigate to="/patient" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
  if (user.role === 'receptionist') return <Navigate to="/admin" replace />;
  return <Navigate to="/admin" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin & Receptionist */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin', 'receptionist']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/patients" element={<ProtectedRoute roles={['admin', 'receptionist']}><Patients /></ProtectedRoute>} />
      <Route path="/admin/doctors" element={<ProtectedRoute roles={['admin', 'receptionist']}><Doctors /></ProtectedRoute>} />
      <Route path="/admin/consultation-rooms" element={<ProtectedRoute roles={['admin', 'receptionist']}><ConsultationRooms /></ProtectedRoute>} />
      <Route path="/admin/appointment-slots" element={<ProtectedRoute roles={['admin', 'receptionist']}><AppointmentSlots /></ProtectedRoute>} />
      <Route path="/admin/constraints" element={<ProtectedRoute roles={['admin', 'receptionist']}><Constraints /></ProtectedRoute>} />
      <Route path="/admin/generate-schedule" element={<ProtectedRoute roles={['admin', 'receptionist']}><GenerateSchedule /></ProtectedRoute>} />
      <Route path="/admin/schedule" element={<ProtectedRoute roles={['admin', 'receptionist']}><Schedule /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/schedule" element={<ProtectedRoute roles={['doctor']}><DoctorSchedule /></ProtectedRoute>} />
      <Route path="/doctor/availability" element={<ProtectedRoute roles={['doctor']}><DoctorAvailability /></ProtectedRoute>} />

      {/* Patient */}
      <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><PatientAppointments /></ProtectedRoute>} />
      <Route path="/patient/availability" element={<ProtectedRoute roles={['patient']}><PatientAvailability /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a2e', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)' }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
