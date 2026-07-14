import { Link } from 'react-router-dom';
import { Activity, ArrowRight, CalendarCheck2, FileText, Mail, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import Footer from '../components/Footer';

const featureCards = [
  {
    title: 'Smart Appointment Booking',
    description: 'Book, reschedule, or cancel appointments in a few seconds with an intuitive workflow.',
    icon: CalendarCheck2,
  },
  {
    title: 'AI Pre-Visit Summary',
    description: 'Generate concise summaries before consultations to help doctors prepare faster.',
    icon: Sparkles,
  },
  {
    title: 'AI Post-Visit Summary',
    description: 'Capture follow-up notes and next-step recommendations automatically after visits.',
    icon: FileText,
  },
  {
    title: 'Google Calendar Integration',
    description: 'Keep appointments synced with Google Calendar for better time management.',
    icon: CalendarCheck2,
  },
  {
    title: 'Email Notifications',
    description: 'Send confirmations, reminders, and follow-ups to patients and providers.',
    icon: Mail,
  },
  {
    title: 'Secure Role-Based Access',
    description: 'Protect sensitive workflows with clear access for admins, doctors, and patients.',
    icon: ShieldCheck,
  },
];

const workflowSteps = [
  {
    title: 'Patient',
    description: 'Book appointment',
  },
  {
    title: 'Doctor',
    description: 'Consultation + AI',
  },
  {
    title: 'Follow-up',
    description: 'Email + Calendar',
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main>
        <Hero />

        <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <Activity className="h-4 w-4" />
              Intelligent care coordination
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need for modern healthcare scheduling
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              From booking to follow-up, our platform helps clinics deliver faster, more connected care.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section id="about" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">How it works</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  A seamless journey from booking to follow-up
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Patients can book appointments quickly, doctors can review AI-supported summaries, and clinics can keep every step connected with smart reminders and calendar sync.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
                <div className="space-y-6">
                  {workflowSteps.map((step, index) => (
                    <div key={step.title} className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{step.title}</p>
                        <p className="text-slate-600">{step.description}</p>
                      </div>
                      {index < workflowSteps.length - 1 && <ArrowRight className="ml-auto h-5 w-5 text-slate-400" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Landing;
