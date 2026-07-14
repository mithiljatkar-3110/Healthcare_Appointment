import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';
import { ClipboardCheck, FileText, LoaderCircle, Plus, Sparkles, Trash2 } from 'lucide-react';
import api from '../../api/api';
import { patientName } from '../../components/AppointmentCard';

const emptyMedicine = { name: '', dosage: '', frequency: '', days: 5 };

const SummaryList = ({ title, items }) => <div className="rounded-xl border border-blue-100 bg-white p-4"><p className="font-semibold text-slate-900">{title}</p>{items?.length ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500">Not available</p>}</div>;

function ConsultationPage() {
  const location = useLocation();
  const appointment = location.state?.appointment;
  const [submitting, setSubmitting] = useState(false);
  const [savedAppointment, setSavedAppointment] = useState(null);
  const { register, control, handleSubmit, formState: { errors } } = useForm({ defaultValues: { clinicalNotes: '', prescription: { medicines: [emptyMedicine] } } });
  const { fields, append, remove } = useFieldArray({ control, name: 'prescription.medicines' });

  const submit = async (data) => {
    if (!appointment?.id) return;
    setSubmitting(true);
    try {
      const response = await api.put(`/appointments/${appointment.id}/consultation`, data);
      const completed = response.data?.appointment;
      setSavedAppointment(completed);
      toast.success('Consultation completed and post-visit summary generated.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save the consultation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!appointment) return <div className="space-y-6"><section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-800 to-blue-900 p-7 text-white"><p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-200">Consultation</p><h1 className="mt-2 text-3xl font-semibold">Select a patient to begin</h1><p className="mt-3 text-sm text-slate-300">Open a patient from today&apos;s appointment queue to record clinical notes and a prescription.</p></section><Link to="/doctor/appointments" className="inline-flex rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Open today&apos;s appointments</Link></div>;

  const summary = savedAppointment?.postVisitSummary;
  return <div className="space-y-6"><section className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-800 to-blue-900 p-7 text-white"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.2em] text-blue-200">Consultation</p><h1 className="mt-2 text-3xl font-semibold">{patientName(appointment)}</h1><p className="mt-2 text-sm text-slate-300">Document the clinical assessment and treatment plan for this visit.</p></div><span className="w-fit rounded-full bg-white/10 px-3 py-1 text-sm text-blue-100">{appointment.symptoms || 'General consultation'}</span></div></section>
    {summary ? <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-600 p-3 text-white"><Sparkles className="h-5 w-5" /></div><div><p className="text-sm font-semibold text-blue-700">AI post-visit summary</p><h2 className="text-xl font-semibold text-slate-900">Patient-friendly follow-up guidance</h2></div></div><div className="mt-5 grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-white p-4"><p className="font-semibold text-slate-900">Diagnosis</p><p className="mt-2 text-sm text-slate-600">{summary.diagnosis || 'Not available'}</p></div><SummaryList title="Medication schedule" items={summary.medicationSchedule} /><SummaryList title="Lifestyle advice" items={summary.lifestyleAdvice} /><SummaryList title="Follow-up steps" items={summary.followUpSteps} /></div></section> : <form onSubmit={handleSubmit(submit)} className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-2xl bg-violet-50 p-3 text-violet-600"><FileText className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold text-slate-900">Clinical notes</h2><p className="text-sm text-slate-600">Record findings, assessment, and care instructions.</p></div></div><label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="clinicalNotes">Notes <span className="text-rose-600">*</span></label><textarea id="clinicalNotes" rows="15" {...register('clinicalNotes', { required: 'Clinical notes are required.' })} placeholder="Document clinical findings, assessment, and instructions..." className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />{errors.clinicalNotes ? <p className="mt-2 text-sm text-rose-600">{errors.clinicalNotes.message}</p> : null}</section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><ClipboardCheck className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold text-slate-900">Prescription</h2><p className="text-sm text-slate-600">Add each prescribed medicine.</p></div></div><button type="button" onClick={() => append(emptyMedicine)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"><Plus className="h-4 w-4" />Add</button></div><div className="mt-6 space-y-4">{fields.map((field, index) => <div key={field.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-slate-800">Medicine {index + 1}</p>{fields.length > 1 ? <button type="button" onClick={() => remove(index)} className="text-rose-600"><Trash2 className="h-4 w-4" /></button> : null}</div><div className="grid gap-3 sm:grid-cols-2"><input {...register(`prescription.medicines.${index}.name`, { required: true })} placeholder="Medicine name" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /><input {...register(`prescription.medicines.${index}.dosage`, { required: true })} placeholder="Dosage (e.g. 500 mg)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /><input {...register(`prescription.medicines.${index}.frequency`, { required: true })} placeholder="Frequency (e.g. twice daily)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /><input type="number" min="1" {...register(`prescription.medicines.${index}.days`, { required: true, valueAsNumber: true, min: 1 })} placeholder="Days" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /></div></div>)}</div><button type="submit" disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}{submitting ? 'Submitting consultation...' : 'Submit consultation'}</button></section></form>}</div>;
}
export default ConsultationPage;
