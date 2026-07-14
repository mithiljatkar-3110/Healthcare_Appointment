import { CalendarDays, Clock3, FilePenLine, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export const statusTone = (status) => {
  const value = (status || 'BOOKED').toUpperCase();
  if (value === 'COMPLETED') return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
  if (value === 'CANCELLED' || value === 'NO_SHOW') return 'bg-rose-50 text-rose-700 ring-rose-100';
  return 'bg-amber-50 text-amber-700 ring-amber-100';
};

export const patientName = (appointment) => appointment.patient?.user?.name || appointment.patientName || 'Patient';

export const formatVisitTime = (value) => {
  if (!value) return 'Time not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

function AppointmentCard({ appointment, showAction = true }) {
  const name = patientName(appointment);
  const date = appointment.slotStart ? new Date(appointment.slotStart) : null;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><UserRound className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">{name}</h3>
            <p className="mt-1 text-sm text-slate-500">{appointment.patient?.user?.email || appointment.patientEmail || 'Scheduled patient'}</p>
          </div>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusTone(appointment.status)}`}>{(appointment.status || 'BOOKED').replace('_', ' ')}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-slate-400" />{date ? date.toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-slate-400" />{formatVisitTime(appointment.slotStart)}</span>
      </div>
      {appointment.symptoms ? <p className="mt-4 line-clamp-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600"><span className="font-medium text-slate-700">Reason: </span>{appointment.symptoms}</p> : null}
      {showAction && appointment.status !== 'COMPLETED' ? <Link to="/doctor/consultation" state={{ appointment }} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"><FilePenLine className="h-4 w-4" />Start consultation</Link> : null}
    </article>
  );
}

export default AppointmentCard;
