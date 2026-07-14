import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AppointmentCard from '../../components/AppointmentCard';
import { currentDate, getDoctorAppointments } from './doctorAppointments';

const Stat = ({ icon: Icon, label, value, tone }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p></div><div className={`rounded-2xl p-3 ${tone}`}><Icon className="h-5 w-5" /></div></div></div>;

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setAppointments(await getDoctorAppointments({ date: currentDate() }));
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load today\'s appointments.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const booked = useMemo(() => appointments.filter((item) => item.status === 'BOOKED').length, [appointments]);
  const completed = useMemo(() => appointments.filter((item) => item.status === 'COMPLETED').length, [appointments]);
  return <div className="space-y-6">
    <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-800 to-blue-900 p-7 text-white shadow-sm sm:p-8"><p className="text-sm font-semibold uppercase tracking-[.22em] text-blue-200">Doctor workspace</p><div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h1 className="text-3xl font-semibold">Your day at a glance</h1><p className="mt-2 max-w-xl text-sm text-slate-300">Review your patient queue, stay ahead of consultations, and document care with confidence.</p></div><Link to="/doctor/appointments" className="w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900">View today&apos;s queue</Link></div></section>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={CalendarClock} label="Today's visits" value={loading ? '—' : appointments.length} tone="bg-blue-50 text-blue-600" /><Stat icon={ClipboardList} label="Awaiting consult" value={loading ? '—' : booked} tone="bg-amber-50 text-amber-600" /><Stat icon={CheckCircle2} label="Completed" value={loading ? '—' : completed} tone="bg-emerald-50 text-emerald-600" /><Stat icon={UsersRound} label="Patients today" value={loading ? '—' : appointments.length} tone="bg-violet-50 text-violet-600" /></div>
    <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-semibold text-slate-900">Today&apos;s queue</h2><p className="mt-1 text-sm text-slate-600">Your scheduled patient consultations.</p></div><Link to="/doctor/appointments" className="text-sm font-semibold text-blue-700">See all</Link></div>{loading ? <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-52 animate-pulse rounded-2xl bg-slate-100" />)}</div> : appointments.length ? <div className="grid gap-4 lg:grid-cols-2">{appointments.slice(0, 4).map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">No appointments are scheduled for today.</div>}</section>
  </div>;
}
export default DoctorDashboard;
