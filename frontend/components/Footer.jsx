function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 py-10 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-center md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-lg font-semibold text-white">Healthcare Appointment System</p>
          <p className="mt-1 text-sm">Built using React, Express, Prisma, PostgreSQL, Groq AI, and Google Calendar.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="rounded-full border border-white/10 px-3 py-1">React</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Express</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Prisma</span>
          <span className="rounded-full border border-white/10 px-3 py-1">PostgreSQL</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Groq AI</span>
          <span className="rounded-full border border-white/10 px-3 py-1">Google Calendar</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
