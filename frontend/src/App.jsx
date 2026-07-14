import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../routes/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPlaceholder from '../pages/DashboardPlaceholder';
import AdminDashboard from '../pages/admin/AdminDashboard';
import DoctorsPage from '../pages/admin/DoctorsPage';
import LeavesPage from '../pages/admin/LeavesPage';
import AppointmentsPage from '../pages/admin/AppointmentsPage';
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientAppointmentsPage from '../pages/patient/PatientAppointmentsPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<DoctorsPage />} />
          <Route path="/admin/leaves" element={<LeavesPage />} />
          <Route path="/admin/appointments" element={<AppointmentsPage />} />

          <Route
            path="/doctor"
            element={<DashboardPlaceholder title="Doctor Dashboard" description="Doctor workspace content will be added here soon." />}
          />
          <Route
            path="/doctor/appointments"
            element={<DashboardPlaceholder title="Today's Appointments" description="Appointment queue content will be added here soon." />}
          />
          <Route
            path="/doctor/consultation"
            element={<DashboardPlaceholder title="Consultation" description="Consultation workflow content will be added here soon." />}
          />

          <Route path="/patient" element={<Navigate to="/patient/book" replace />} />
          <Route path="/patient/book" element={<PatientDashboard />} />
          <Route path="/patient/book-appointment" element={<Navigate to="/patient/book" replace />} />
          <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
          <Route path="/patient/profile" element={<DashboardPlaceholder title="Profile" description="Patient profile content will be added here soon." />} />
        </Route>
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </>
  );
}

export default App;
