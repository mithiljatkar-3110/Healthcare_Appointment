const prisma = require('../config/db');

const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
};

const getSlots = async (doctorId, dateValue) => {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: { workingHours: true, slotDuration: true },
  });

  if (!doctor) {
    throw createError('Doctor not found.', 404);
  }

  const leave = await prisma.leave.findUnique({
    where: { doctorId_date: { doctorId, date } },
    select: { id: true },
  });

  if (leave) {
    return { available: false, reason: 'Doctor is on leave' };
  }

  const dayKey = WEEKDAYS[date.getUTCDay()];
  const range = doctor.workingHours[dayKey];

  if (!Array.isArray(range) || range.length !== 2) {
    return [];
  }

  const [startTime, endTime] = range;
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: 'BOOKED',
      slotStart: { gte: date, lt: nextDate },
    },
    select: { slotStart: true },
  });
  const bookedStartTimes = new Set(
    appointments.map(({ slotStart }) => slotStart.toISOString().slice(11, 16)),
  );

  const slots = [];
  for (let start = startMinutes; start + doctor.slotDuration <= endMinutes; start += doctor.slotDuration) {
    const slot = { start: formatTime(start), end: formatTime(start + doctor.slotDuration) };

    if (!bookedStartTimes.has(slot.start)) {
      slots.push(slot);
    }
  }

  return slots;
};

module.exports = { getSlots };
