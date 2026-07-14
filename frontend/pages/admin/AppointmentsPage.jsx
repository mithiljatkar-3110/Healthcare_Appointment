import { useEffect, useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/admin/doctors');
        const doctors = response.data?.doctors || [];
        const combined = doctors.flatMap((doctor) =>
          (doctor.appointments || []).map((appointment) => ({
            ...appointment,
            doctorName: doctor.user?.name || 'Unknown',
          })),
        );
        setAppointments(combined);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
        <p className="mt-2 text-sm text-slate-600">Review the clinic’s appointment activity.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">Loading appointments...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Doctor</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Start</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-sm text-slate-500">No appointments found.</td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{appointment.doctorName}</td>
                    <td className="px-4 py-3 text-slate-600">{appointment.status}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(appointment.slotStart).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(appointment.slotEnd).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AppointmentsPage;
