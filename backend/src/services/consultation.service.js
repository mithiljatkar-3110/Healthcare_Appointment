const prisma = require('../config/db');
const { generatePostVisitSummary } = require('./llm.service');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const saveConsultation = async (appointmentId, doctorUserId, { clinicalNotes, prescription }) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: { select: { userId: true } } },
  });

  if (!appointment) {
    throw createError('Appointment not found.', 404);
  }

  if (appointment.doctor.userId !== doctorUserId) {
    throw createError('You are not assigned to this appointment.', 403);
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { clinicalNotes },
  });

  try {
    const postVisitSummary = await generatePostVisitSummary(clinicalNotes, prescription);
    return await prisma.appointment.update({
      where: { id: appointmentId },
      data: { prescription, postVisitSummary, status: 'COMPLETED' },
    });
  } catch (error) {
    console.error(`Post-visit summary generation failed for appointment ${appointmentId}:`, error.message);
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { prescription, postVisitSummary: null, status: 'COMPLETED' },
    });
  }
};

module.exports = { saveConsultation };
