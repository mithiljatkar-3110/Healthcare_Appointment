import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

function Hero() {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-50 via-white to-slate-100 py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Trusted by modern clinics
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            AI-Powered Healthcare Appointment &amp; Follow-up System
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Book appointments effortlessly, receive AI-assisted health summaries, manage consultations, and stay connected with your doctor.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700">
              Book Appointment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:border-blue-600 hover:text-blue-600">
              Get Started
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="rounded-2xl bg-slate-900 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Care made simple</p>
            <div className="mt-6 space-y-4">
              {[
                'Appointment booking with smart scheduling',
                'AI summaries for pre- and post-visit care',
                'Notifications and calendar reminders',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                  <span className="text-sm text-slate-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
