const prisma = require('../config/db');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getDayRange = (dateValue) => {
  if (!dateValue) return null;

  const start = new Date(`${dateValue}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { gte: start, lt: end };
};

const getDoctorAppointments = async (doctorUserId, { status, date, search } = {}) => {
  const doctor = await prisma.doctor.findUnique({
    where: { userId: doctorUserId },
    select: { id: true },
  });

  if (!doctor) {
    throw createError('Doctor profile not found.', 404);
  }

  const where = {
    doctorId: doctor.id,
    ...(status ? { status } : {}),
    ...(date ? { slotStart: getDayRange(date) } : {}),
    ...(search
      ? {
          patient: {
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        }
      : {}),
  };

  const appointments = await prisma.appointment.findMany({
    where,
    select: {
      id: true,
      slotStart: true,
      slotEnd: true,
      symptoms: true,
      status: true,
      preVisitSummary: true,
      postVisitSummary: true,
      prescription: true,
      clinicalNotes: true,
      patient: { select: { user: { select: { name: true, email: true } } } },
    },
    // The AppointmentStatus enum is ordered BOOKED, COMPLETED, CANCELLED, NO_SHOW.
    // This keeps the active/upcoming queue ahead of completed consultations.
    orderBy: [{ status: 'asc' }, { slotStart: 'asc' }],
  });

  return appointments.map(({ patient, ...appointment }) => ({
    ...appointment,
    patientName: patient.user.name,
    patientEmail: patient.user.email,
  }));
};

module.exports = { getDoctorAppointments };
