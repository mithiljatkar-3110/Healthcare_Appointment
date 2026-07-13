const prisma = require('../config/db');
const { generatePreVisitSummary } = require('./llm.service');
const { createAppointmentEvent } = require('./calendar.service');
const { sendBookingConfirmation } = require('./notification.service');

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const TRANSACTION_OPTIONS = { maxWait: 5_000, timeout: 10_000 };

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const validateSlot = (doctor, slotStart) => {
  const dayKey = WEEKDAYS[slotStart.getUTCDay()];
  const range = doctor.workingHours[dayKey];

  if (!Array.isArray(range) || range.length !== 2) {
    throw createError('The requested slot is not available.', 409);
  }

  const startMinutes = slotStart.getUTCHours() * 60 + slotStart.getUTCMinutes();
  const workingStart = toMinutes(range[0]);
  const workingEnd = toMinutes(range[1]);
  const slotEndMinutes = startMinutes + doctor.slotDuration;

  if (
    slotStart.getUTCSeconds() !== 0 ||
    slotStart.getUTCMilliseconds() !== 0 ||
    startMinutes < workingStart ||
    slotEndMinutes > workingEnd ||
    (startMinutes - workingStart) % doctor.slotDuration !== 0
  ) {
    throw createError('The requested slot is not available.', 409);
  }

  return new Date(slotStart.getTime() + doctor.slotDuration * 60_000);
};

const createAppointment = async ({ doctorId, patientId, slotStart, symptoms }) => {
  const start = new Date(slotStart);
  const dayStart = new Date(start);
  dayStart.setUTCHours(0, 0, 0, 0);

  let doctorName = null;
  let patientName = null;
  let slotEnd = null;

  try {
    const appointment = await prisma.$transaction(async (tx) => {
      const [doctor, patient] = await Promise.all([
        tx.doctor.findUnique({
          where: { id: doctorId },
          select: {
            id: true,
            workingHours: true,
            slotDuration: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        }),
        tx.patient.findUnique({
          where: { id: patientId },
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

      if (!doctor) {
        throw createError('Doctor not found.', 404);
      }

      if (!patient) {
        throw createError('Patient not found.', 404);
      }

      doctorName = doctor.user?.name || null;
      patientName = patient.user?.name || null;

      const leave = await tx.leave.findUnique({
        where: { doctorId_date: { doctorId, date: dayStart } },
        select: { id: true },
      });

      if (leave) {
        throw createError('The doctor is on leave for the requested date.', 409);
      }

      slotEnd = validateSlot(doctor, start);

      return tx.appointment.create({
        data: { doctorId, patientId, slotStart: start, slotEnd, symptoms },
      });
    }, TRANSACTION_OPTIONS);

    const calendarResult = await createAppointmentEvent({
      appointmentId: appointment.id,
      doctorName,
      patientName,
      symptoms,
      slotStart: start,
      slotEnd,
    });

    if (calendarResult.eventId) {
      try {
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { calendarEventIdDoctor: calendarResult.eventId },
        });
      } catch (calendarUpdateError) {
        console.warn(
          `Unable to persist Google Calendar event ID for appointment ${appointment.id}: ${calendarUpdateError.message}`,
        );
      }
    } else {
      console.warn(`Google Calendar integration did not return an event for appointment ${appointment.id}. Booking will continue without a calendar link.`);
    }

    void sendBookingConfirmation(appointment.id, {
      calendarHtmlLink: calendarResult.htmlLink,
    }).catch((error) => {
      console.error(`Booking confirmation notification failed for appointment ${appointment.id}:`, error.message);
    });

    try {
      const preVisitSummary = await generatePreVisitSummary(symptoms);
      return await prisma.appointment.update({
        where: { id: appointment.id },
        data: { preVisitSummary, llmFailed: false },
      });
    } catch (llmError) {
      console.error(`Pre-visit summary generation failed for appointment ${appointment.id}:`, llmError.message);

      try {
        return await prisma.appointment.update({
          where: { id: appointment.id },
          data: { llmFailed: true },
        });
      } catch (updateError) {
        console.error(`Unable to mark LLM failure for appointment ${appointment.id}:`, updateError.message);
        return { ...appointment, llmFailed: true };
      }
    }
  } catch (error) {
    if (error.code === 'P2002') {
      throw createError('This slot has already been booked.', 409);
    }

    throw error;
  }
};

module.exports = { createAppointment };
