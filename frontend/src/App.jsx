import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../routes/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import DoctorsPage from '../pages/admin/DoctorsPage';
import LeavesPage from '../pages/admin/LeavesPage';
import PatientDashboard from '../pages/patient/PatientDashboard';
import PatientAppointmentsPage from '../pages/patient/PatientAppointmentsPage';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import TodaysAppointments from '../pages/doctor/TodaysAppointments';
import ConsultationPage from '../pages/doctor/ConsultationPage';
import NotFound from '../pages/NotFound';

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

          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<TodaysAppointments />} />
          <Route path="/doctor/consultation" element={<ConsultationPage />} />

          <Route path="/patient" element={<Navigate to="/patient/book" replace />} />
          <Route path="/patient/book" element={<PatientDashboard />} />
          <Route path="/patient/book-appointment" element={<Navigate to="/patient/book" replace />} />
          <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '14px', background: '#0f172a', color: '#fff', padding: '14px 16px' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#fb7185', secondary: '#fff' } } }} />
    </>
  );
}

export default App;
