import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = user?.role?.toUpperCase();

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
          { to: '/admin/doctors', label: 'Doctors', icon: 'Stethoscope' },
          { to: '/admin/leaves', label: 'Leaves', icon: 'CalendarX2' },
          { to: '/admin/appointments', label: 'Appointments', icon: 'CalendarDays' },
        ];
      case 'DOCTOR':
        return [
          { to: '/doctor', label: 'Dashboard', icon: 'LayoutDashboard' },
          { to: '/doctor/appointments', label: "Today's Appointments", icon: 'CalendarClock' },
          { to: '/doctor/consultation', label: 'Consultation', icon: 'FileText' },
        ];
      case 'PATIENT':
        return [
          { to: '/patient/book', label: 'Book Appointment', icon: 'CalendarPlus' },
          { to: '/patient/appointments', label: 'My Appointments', icon: 'CalendarRange' },
          { to: '/patient/profile', label: 'Profile', icon: 'UserCircle' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm lg:hidden"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <aside
          className={`w-full rounded-3xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-24 lg:block lg:w-72 ${sidebarOpen ? 'block' : 'hidden'}`}
        >
          <Sidebar navItems={getNavItems()} role={role || 'USER'} />
        </aside>

        <main className="min-w-0 flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
