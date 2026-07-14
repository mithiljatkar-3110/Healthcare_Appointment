import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight, CalendarDays, Search, Stethoscope } from 'lucide-react';
import api from '../../api/api';

const formatWorkingHours = (workingHours) => {
  if (!workingHours || typeof workingHours !== 'object') return 'Flexible schedule';

  const entries = Object.entries(workingHours)
    .filter(([, value]) => Array.isArray(value) && value.length === 2)
    .slice(0, 3);

  if (!entries.length) return 'Flexible schedule';

  return entries.map(([day, value]) => `${day.toUpperCase()}: ${value[0]}-${value[1]}`).join(' • ');
};

function PatientDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { register, handleSubmit, reset } = useForm({ defaultValues: { symptoms: '' } });

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await api.get('/doctors');
      const nextDoctors = Array.isArray(response.data?.doctors)
        ? response.data.doctors
        : Array.isArray(response.data)
          ? response.data
          : [];
      setDoctors(nextDoctors);
      if (!selectedDoctorId && nextDoctors[0]) {
        setSelectedDoctorId(nextDoctors[0].id);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load doctors.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;

    try {
      setLoadingSlots(true);
      const response = await api.get(`/doctors/${doctorId}/slots?date=${date}`);
      const nextSlots = response.data?.available === false ? [] : Array.isArray(response.data) ? response.data : [];
      setSlots(nextSlots);
      setSelectedSlot('');
    } catch (error) {
      setSlots([]);
      toast.error(error?.response?.data?.message || 'Unable to load available slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      loadSlots(selectedDoctorId, selectedDate);
    }
  }, [selectedDoctorId, selectedDate]);

  const filteredDoctors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return doctors;

    return doctors.filter((doctor) => {
      const name = doctor.user?.name || '';
      const specialization = doctor.specialization || '';
      return `${name} ${specialization}`.toLowerCase().includes(query);
    });
  }, [doctors, searchTerm]);

  const selectedDoctor = useMemo(() => doctors.find((doctor) => doctor.id === selectedDoctorId) || null, [doctors, selectedDoctorId]);

  const viewSlots = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setSelectedSlot('');
  };

  const onSubmit = async (data) => {
    if (!selectedDoctorId || !selectedSlot) {
      toast.error('Please choose a doctor and a time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const slotStart = `${selectedDate}T${selectedSlot}:00.000Z`;
      await api.post('/appointments', {
        doctorId: selectedDoctorId,
        slotStart,
        symptoms: data.symptoms || '',
      });

      const existing = JSON.parse(localStorage.getItem('patientAppointments') || '[]');
      const nextAppointment = {
        id: `${selectedDoctorId}-${slotStart}`,
        doctorName: selectedDoctor?.user?.name || 'Doctor',
        specialization: selectedDoctor?.specialization || 'General Care',
        slotStart,
        status: 'BOOKED',
        symptoms: data.symptoms || '',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('patientAppointments', JSON.stringify([nextAppointment, ...existing]));
      reset();
      setSelectedSlot('');
      toast.success('Appointment booked successfully.');
      navigate('/patient/appointments');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 text-white shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">Book Appointment</p>
          <h1 className="mt-3 text-3xl font-semibold">Find the right care, faster.</h1>
          <p className="mt-3 text-sm text-slate-300">Search doctors, review available times, and confirm your visit in just a few steps.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Search Doctor</h2>
            <p className="text-sm text-slate-600">Search by doctor name or specialization.</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="doctor-search">
            Search doctors
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="doctor-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-9 pr-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Try Dr. Singh or Cardiology"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Doctors</h3>
              <p className="text-sm text-slate-600">Choose a doctor to view their available slots.</p>
            </div>
          </div>

          {loadingDoctors ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No doctors match your search right now.
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{doctor.user?.name || 'Doctor'}</p>
                    <p className="mt-1 text-sm text-slate-600">{doctor.specialization || 'General Care'}</p>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium text-slate-900">Working hours:</span> {formatWorkingHours(doctor.workingHours)}</p>
                      <p><span className="font-medium text-slate-900">Slot duration:</span> {doctor.slotDuration || 30} min</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => viewSlots(doctor.id)}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    View Slots
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Available Slots</h3>
              <p className="text-sm text-slate-600">Select a doctor first to see the available times for the chosen date.</p>
            </div>
          </div>

          {selectedDoctor ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Selected doctor</p>
                <p className="mt-1 text-sm text-slate-700">{selectedDoctor.user?.name || 'Doctor'} • {selectedDoctor.specialization || 'General Care'}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Choose a date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {loadingSlots ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-14 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No slots available for the selected date.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {slots.map((slot) => (
                    <button
                      key={`${slot.start}-${slot.end}`}
                      type="button"
                      onClick={() => setSelectedSlot(slot.start)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${selectedSlot === slot.start ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>{slot.start}</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{slot.end}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedSlot ? (
                <form className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Symptoms</p>
                    <p className="mt-1 text-sm text-slate-600">Share any concerns before the appointment.</p>
                  </div>

                  <textarea
                    rows="5"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Briefly describe your symptoms or reason for the visit"
                    {...register('symptoms')}
                  />

                  <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
                    {submitting ? 'Booking...' : 'Book Appointment'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Choose a doctor card to unlock available slots and booking details.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default PatientDashboard;
