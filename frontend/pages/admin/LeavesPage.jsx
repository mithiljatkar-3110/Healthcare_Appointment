import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { CalendarPlus, Trash2 } from 'lucide-react';
import api from '../../api/api';

const readLeaveRecords = () => {
  try {
    return JSON.parse(localStorage.getItem('adminLeaveRecords') || '[]');
  } catch {
    return [];
  }
};

const writeLeaveRecords = (records) => {
  localStorage.setItem('adminLeaveRecords', JSON.stringify(records));
};

function LeavesPage() {
  const [doctors, setDoctors] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState(() => readLeaveRecords());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      doctorId: '',
      date: '',
    },
  });

  const loadDoctors = async () => {
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(response.data?.doctors || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const doctor = doctors.find((item) => item.id === data.doctorId);
      await api.post(`/admin/doctors/${data.doctorId}/leaves`, { date: data.date });

      const nextRecords = [
        ...readLeaveRecords(),
        {
          id: `${data.doctorId}-${data.date}`,
          doctorId: data.doctorId,
          doctorName: doctor?.user?.name || 'Doctor',
          date: data.date,
        },
      ];
      writeLeaveRecords(nextRecords);
      setLeaveRecords(nextRecords);

      toast.success('Leave recorded.');
      reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to record leave.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveLeave = async (doctorId, leaveId) => {
    try {
      await api.delete(`/admin/doctors/${doctorId}/leaves/${leaveId}`);
      const nextRecords = readLeaveRecords().filter((item) => item.id !== leaveId);
      writeLeaveRecords(nextRecords);
      setLeaveRecords(nextRecords);
      toast.success('Leave removed.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to remove leave.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Leave Management</h1>
        <p className="mt-2 text-sm text-slate-600">Create and remove doctor leave entries for specific dates.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Add Leave</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Doctor</label>
            <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2" {...register('doctorId', { required: 'Please select a doctor' })}>
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>{doctor.user?.name}</option>
              ))}
            </select>
            {errors.doctorId ? <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
            <input type="date" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2" {...register('date', { required: 'Date is required' })} />
            {errors.date ? <p className="mt-1 text-sm text-red-600">{errors.date.message}</p> : null}
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              <CalendarPlus className="h-4 w-4" />
              {submitting ? 'Saving...' : 'Record Leave'}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">Loading leaves...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Doctor</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Leave Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leaveRecords.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-6 text-center text-sm text-slate-500">No leave records yet.</td>
                </tr>
              ) : (
                leaveRecords.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{leave.doctorName}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(leave.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleRemoveLeave(leave.doctorId, leave.id)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
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

export default LeavesPage;
