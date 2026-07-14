import { useEffect, useState } from 'react';
import { CalendarClock, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AppointmentCard from '../../components/AppointmentCard';
import { currentDate, getDoctorAppointments } from './doctorAppointments';

const statuses = ['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

function TodaysAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [date, setDate] = useState(currentDate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const params = { date };
        if (status !== 'ALL') params.status = status;
        if (query.trim()) params.search = query.trim();
        setAppointments(await getDoctorAppointments(params));
      } catch (error) {
        setAppointments([]);
        toast.error(error?.response?.data?.message || 'Unable to load appointments.');
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [date, query, status]);

  return <div className="space-y-6"><section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-800 to-blue-900 p-7 text-white"><div className="flex items-center gap-3"><div className="rounded-2xl bg-white/10 p-3"><CalendarClock className="h-6 w-6" /></div><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-200">Patient queue</p><h1 className="mt-1 text-3xl font-semibold">Appointments</h1></div></div><p className="mt-4 text-sm text-slate-300">Find a patient, filter the queue, and begin a consultation.</p></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-4 lg:grid-cols-[1fr_auto]"><div><label htmlFor="patient-search" className="mb-2 block text-sm font-medium text-slate-700">Search patient</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="patient-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by patient name or email" className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div><div><label htmlFor="appointment-date" className="mb-2 block text-sm font-medium text-slate-700">Appointment date</label><input id="appointment-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></div><div className="mt-5 flex flex-wrap gap-2">{statuses.map((value) => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full px-3 py-2 text-sm font-medium transition ${status === value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{value === 'ALL' ? 'All statuses' : value.replace('_', ' ')}</button>)}</div></section>{loading ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-100" />)}</section> : appointments.length ? <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}</section> : <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">No appointments match the selected date and filters.</div>}</div>;
}
export default TodaysAppointments;
