import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Pencil, Plus, Trash2, CalendarX2 } from 'lucide-react';
import api from '../../api/api';

const defaultWorkingHours = {
  mon: ['09:00', '17:00'],
  tue: ['09:00', '17:00'],
  wed: ['09:00', '17:00'],
  thu: ['09:00', '17:00'],
  fri: ['09:00', '17:00'],
  sat: ['10:00', '14:00'],
  sun: ['10:00', '14:00'],
};

function DoctorModal({ open, mode, doctor, onClose, onSaved }) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      specialization: '',
      slotDuration: 30,
      workingHours: JSON.stringify(defaultWorkingHours, null, 2),
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && doctor) {
        reset({
          name: doctor.user?.name || '',
          email: doctor.user?.email || '',
          password: '',
          specialization: doctor.specialization || '',
          slotDuration: doctor.slotDuration || 30,
          workingHours: JSON.stringify(doctor.workingHours || defaultWorkingHours, null, 2),
        });
      } else {
        reset({
          name: '',
          email: '',
          password: '',
          specialization: '',
          slotDuration: 30,
          workingHours: JSON.stringify(defaultWorkingHours, null, 2),
        });
      }
    }
  }, [doctor, mode, open, reset]);

  const onSubmit = async (data) => {
    try {
      let payload = {
        specialization: data.specialization,
        slotDuration: Number(data.slotDuration),
        workingHours: JSON.parse(data.workingHours),
      };

      if (mode === 'create') {
        payload = {
          ...payload,
          name: data.name,
          email: data.email,
          password: data.password,
        };
      } else if (data.password) {
        payload.password = data.password;
      }

      if (mode === 'create') {
        await api.post('/admin/doctors', payload);
        toast.success('Doctor added successfully.');
      } else {
        await api.put(`/admin/doctors/${doctor.id}`, payload);
        toast.success('Doctor updated successfully.');
      }

      onSaved();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save doctor.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{mode === 'create' ? 'Add Doctor' : 'Edit Doctor'}</h2>
            <p className="mt-1 text-sm text-slate-600">Fill in the doctor profile details below.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">✕</button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {mode === 'create' ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('name', { required: 'Name is required' })} />
                {errors.name ? <p className="mt-1 text-sm text-red-600">{errors.name.message}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('email', { required: 'Email is required' })} />
                {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input type="password" className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })} />
                {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password.message}</p> : null}
              </div>
            </>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Specialization</label>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('specialization', { required: 'Specialization is required' })} />
            {errors.specialization ? <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Slot Duration (minutes)</label>
            <input type="number" className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register('slotDuration', { required: true, min: 5 })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Working Hours (JSON)</label>
            <textarea rows="8" className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm" {...register('workingHours', { required: 'Working hours are required' })} />
            {errors.workingHours ? <p className="mt-1 text-sm text-red-600">{errors.workingHours.message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Doctor' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

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

  const handleAdd = () => {
    setMode('create');
    setSelectedDoctor(null);
    setModalOpen(true);
  };

  const handleEdit = (doctor) => {
    setMode('edit');
    setSelectedDoctor(doctor);
    setModalOpen(true);
  };

  const handleDelete = async (doctor) => {
    if (!window.confirm(`Delete ${doctor.user?.name || 'this doctor'}?`)) return;

    try {
      await api.delete(`/admin/doctors/${doctor.id}`);
      toast.success('Doctor deleted.');
      loadDoctors();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete doctor.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Doctors</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your doctor roster and working hours.</p>
        </div>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">Loading doctors...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Specialization</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Slot Duration</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {doctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{doctor.user?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{doctor.user?.email}</td>
                  <td className="px-4 py-3 text-slate-600">{doctor.specialization}</td>
                  <td className="px-4 py-3 text-slate-600">{doctor.slotDuration} min</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(doctor)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-500 hover:text-blue-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(doctor)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DoctorModal open={modalOpen} mode={mode} doctor={selectedDoctor} onClose={() => setModalOpen(false)} onSaved={loadDoctors} />
    </div>
  );
}

export default DoctorsPage;
