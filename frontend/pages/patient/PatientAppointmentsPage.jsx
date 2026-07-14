import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronDown, ChevronUp, Search, Sparkles, PlusCircle } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

const getStatusTone = (status) => {
  const normalized = (status || '').toUpperCase();

  if (['BOOKED', 'CONFIRMED', 'UPCOMING', 'PENDING'].includes(normalized)) {
    return 'bg-emerald-50 text-emerald-700';
  }

  if (['COMPLETED', 'DONE'].includes(normalized)) {
    return 'bg-blue-50 text-blue-700';
  }

  if (['CANCELLED', 'CANCELED'].includes(normalized)) {
    return 'bg-rose-50 text-rose-700';
  }

  return 'bg-slate-100 text-slate-700';
};

const getSortRank = (status) => {
  const normalized = (status || '').toUpperCase();

  if (['BOOKED', 'CONFIRMED', 'UPCOMING', 'PENDING'].includes(normalized)) return 0;
  if (['COMPLETED', 'DONE'].includes(normalized)) return 1;
  if (['CANCELLED', 'CANCELED'].includes(normalized)) return 2;
  return 3;
};

const getCalendarLink = (appointment) => {
  if (!appointment?.slotStart) return null;

  const start = new Date(appointment.slotStart);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const formatDate = (date) => date.toISOString().replace(/[-:]/g, '').replace('.000', '');

  const title = encodeURIComponent(`Appointment with ${appointment.doctorName || 'doctor'}`);
  const details = encodeURIComponent(appointment.symptoms || 'Healthcare appointment');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${formatDate(start)}/${formatDate(end)}`;
};

function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadAppointments = () => {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      setAppointments(stored);
      window.setTimeout(() => setLoading(false), 400);
    };

    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const next = appointments.filter((appointment) => {
      const matchesFilter = (() => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Upcoming') return getSortRank(appointment.status) === 0;
        if (activeFilter === 'Completed') return getSortRank(appointment.status) === 1;
        if (activeFilter === 'Cancelled') return getSortRank(appointment.status) === 2;
        return true;
      })();

      if (!query) return matchesFilter;

      const haystack = [appointment.doctorName, appointment.specialization, appointment.status, appointment.symptoms]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesFilter && haystack.includes(query);
    });

    return next.sort((a, b) => {
      const rankDifference = getSortRank(a.status) - getSortRank(b.status);
      if (rankDifference !== 0) return rankDifference;
      return new Date(a.slotStart) - new Date(b.slotStart);
    });
  }, [activeFilter, appointments, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">My Appointments</p>
            <h1 className="mt-3 text-3xl font-semibold">Your care timeline</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">Track visits, filter by status, and review AI-supported summaries in one place.</p>
          </div>
          <Link to="/patient/book" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900">
            <PlusCircle className="h-4 w-4" />
            Book another visit
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="appointment-search">
              Search appointments
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="appointment-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Search by doctor, status, or symptoms"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${activeFilter === filter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          No appointments found. Book a new visit to start building your care history.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => {
            const calendarLink = getCalendarLink(appointment);
            const isExpanded = expandedId === appointment.id;
            const hasSummary = Boolean(appointment.preVisitSummary || appointment.postVisitSummary);

            return (
              <div key={appointment.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusTone(appointment.status)}`}>
                        {appointment.status || 'BOOKED'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{appointment.doctorName || 'Doctor'}</h3>
                      <p className="mt-1 text-sm text-slate-600">{appointment.specialization || 'General Care'}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-900">Date:</span> {new Date(appointment.slotStart).toLocaleDateString()}</p>
                      <p><span className="font-medium text-slate-900">Time:</span> {new Date(appointment.slotStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {calendarLink ? (
                      <a href={calendarLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        <CalendarDays className="h-4 w-4" />
                        Google Calendar
                      </a>
                    ) : null}
                    {hasSummary ? (
                      <button type="button" onClick={() => setExpandedId(isExpanded ? null : appointment.id)} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                        <Sparkles className="h-4 w-4" />
                        {isExpanded ? 'Hide summary' : 'AI summary'}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Symptoms</p>
                  <p className="mt-2 text-sm text-slate-700">{appointment.symptoms || 'No symptoms were provided.'}</p>
                </div>

                {isExpanded && hasSummary ? (
                  <div className="mt-4 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    {appointment.preVisitSummary ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Pre-visit AI Summary</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">Urgency</p>
                            <p className="mt-1">{appointment.preVisitSummary.urgency || 'Not available'}</p>
                          </div>
                          <div className="rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">Chief Complaint</p>
                            <p className="mt-1">{appointment.preVisitSummary.chiefComplaint || 'Not available'}</p>
                          </div>
                        </div>
                        <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900">Suggested Questions</p>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {(appointment.preVisitSummary.suggestedQuestions || []).map((question) => (
                              <li key={question}>{question}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : null}

                    {appointment.postVisitSummary ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Post-visit AI Summary</p>
                        <div className="mt-3 rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700">
                          <p className="font-semibold text-slate-900">Diagnosis</p>
                          <p className="mt-1">{appointment.postVisitSummary.diagnosis || 'Not available'}</p>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <div className="rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">Medication Schedule</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {(appointment.postVisitSummary.medicationSchedule || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">Lifestyle Advice</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {(appointment.postVisitSummary.lifestyleAdvice || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-blue-100 bg-white p-3 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">Follow-up Steps</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {(appointment.postVisitSummary.followUpSteps || []).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PatientAppointmentsPage;
