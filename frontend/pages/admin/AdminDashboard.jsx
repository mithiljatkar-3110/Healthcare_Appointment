import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Stethoscope, UserRound, CheckCircle2 } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const readAdminStats = () => {
  try {
    return JSON.parse(localStorage.getItem('adminStats') || '{}');
  } catch {
    return {};
  }
};

const writeAdminStats = (stats) => {
  localStorage.setItem('adminStats', JSON.stringify(stats));
};

function StatCard({ title, value, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsValues, setStatsValues] = useState(() => readAdminStats());

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/admin/doctors');
        const nextDoctors = response.data?.doctors || [];
        setDoctors(nextDoctors);

        const persistedStats = readAdminStats();
        const nextStats = {
          totalDoctors: nextDoctors.length,
          totalPatients: persistedStats.totalPatients || 0,
          appointments: persistedStats.appointments || 0,
          completed: persistedStats.completed || 0,
        };

        writeAdminStats(nextStats);
        setStatsValues(nextStats);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const stats = useMemo(() => {
    return [
      { title: 'Total Doctors', value: statsValues.totalDoctors || doctors.length, icon: Stethoscope, accent: 'bg-blue-50 text-blue-600' },
      { title: 'Total Patients', value: statsValues.totalPatients || 0, icon: UserRound, accent: 'bg-emerald-50 text-emerald-600' },
      { title: 'Appointments', value: statsValues.appointments || 0, icon: CalendarDays, accent: 'bg-violet-50 text-violet-600' },
      { title: 'Completed', value: statsValues.completed || 0, icon: CheckCircle2, accent: 'bg-amber-50 text-amber-600' },
    ];
  }, [doctors.length, statsValues]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Monitor your clinic health at a glance.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Loading dashboard data...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Doctors Table</h2>
        <p className="mt-2 text-sm text-slate-600">Quick view of registered doctors and their profile details.</p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Specialization</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Slot Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{doctor.user?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{doctor.user?.email}</td>
                  <td className="px-4 py-3 text-slate-600">{doctor.specialization}</td>
                  <td className="px-4 py-3 text-slate-600">{doctor.slotDuration} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
