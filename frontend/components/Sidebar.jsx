import { NavLink } from 'react-router-dom';
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  CalendarX2,
  FileText,
  LayoutDashboard,
  Stethoscope,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Stethoscope,
  CalendarX2,
  CalendarDays,
  CalendarClock,
  FileText,
  CalendarPlus,
  CalendarRange,
};

function Sidebar({ navItems, role }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6 rounded-2xl bg-slate-900 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">{role}</p>
        <h2 className="mt-2 text-lg font-semibold">Workspace</h2>
        <p className="mt-1 text-sm text-slate-300">Manage your healthcare tasks from here.</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
