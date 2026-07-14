import { Link, useLocation } from 'react-router-dom';
import { LogOut, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isLandingPage = location.pathname === '/';

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to={isAuthenticated ? `/${(user?.role || '').toLowerCase()}` : '/'} className="flex items-center gap-3 text-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Healthcare Appointment System</span>
        </Link>

        {isLandingPage ? (
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#home" className="transition hover:text-blue-600">Home</a>
            <a href="#features" className="transition hover:text-blue-600">Features</a>
            <a href="#about" className="transition hover:text-blue-600">About</a>
            <Link to="/login" className="rounded-full border border-slate-300 px-4 py-2 transition hover:border-blue-600 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register" className="rounded-full bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
              Register
            </Link>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            {user ? <span className="text-sm font-medium text-slate-600">{user.name || user.email}</span> : null}
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-600 hover:text-blue-600"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
