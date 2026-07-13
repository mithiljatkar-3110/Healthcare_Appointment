const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const { sendDoctorLeaveNotification } = require('./notification.service');

const BCRYPT_ROUNDS = 12;
const TRANSACTION_OPTIONS = { maxWait: 5_000, timeout: 10_000 };

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const doctorInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  },
};

const getDoctorOrThrow = async (client, id) => {
  const doctor = await client.doctor.findUnique({ where: { id }, include: doctorInclude });

  if (!doctor) {
    throw createError('Doctor not found.', 404);
  }

  return doctor;
};

const createDoctor = async ({ name, email, password, specialization, slotDuration, workingHours }) => {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    return await prisma.$transaction(
      (tx) =>
        tx.doctor.create({
          data: {
            specialization,
            slotDuration,
            workingHours,
            user: {
              create: { name, email, passwordHash, role: 'DOCTOR' },
            },
          },
          include: doctorInclude,
        }),
      TRANSACTION_OPTIONS,
    );
  } catch (error) {
    if (error.code === 'P2002') {
      throw createError('An account with this email already exists.', 409);
    }

    throw error;
  }
};

const getDoctors = () =>
  prisma.doctor.findMany({
    include: doctorInclude,
    orderBy: { createdAt: 'desc' },
  });

const getDoctor = (id) => getDoctorOrThrow(prisma, id);

const updateDoctor = async (id, updates) => {
  await getDoctorOrThrow(prisma, id);

  return prisma.doctor.update({
    where: { id },
    data: updates,
    include: doctorInclude,
  });
};

const deleteDoctor = async (id) => {
  try {
    await prisma.$transaction(async (tx) => {
      const doctor = await getDoctorOrThrow(tx, id);
      await tx.user.delete({ where: { id: doctor.userId } });
    }, TRANSACTION_OPTIONS);
  } catch (error) {
    if (error.code === 'P2003') {
      throw createError('Cannot delete a doctor with existing appointments.', 409);
    }

    throw error;
  }
};

const addLeave = async (doctorId, dateValue) => {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  try {
    const { leave, affectedAppointmentIds } = await prisma.$transaction(async (tx) => {
      await getDoctorOrThrow(tx, doctorId);

      const affectedAppointments = await tx.appointment.findMany({
        where: {
          doctorId,
          status: 'BOOKED',
          slotStart: { gte: date, lt: nextDate },
        },
        select: { id: true },
        orderBy: { slotStart: 'asc' },
      });

      const leave = await tx.leave.create({ data: { doctorId, date } });
      const affectedAppointmentIds = affectedAppointments.map(({ id }) => id);

      return { leave, affectedAppointmentIds };
    }, TRANSACTION_OPTIONS);

    try {
      await sendDoctorLeaveNotification(affectedAppointmentIds);
    } catch (notificationError) {
      console.error(`Doctor leave notifications failed for doctor ${doctorId}:`, notificationError.message);
    }

    return { leave, affectedAppointmentIds };
  } catch (error) {
    if (error.code === 'P2002') {
      throw createError('A leave record already exists for this doctor and date.', 409);
    }

    throw error;
  }
};

const removeLeave = async (doctorId, leaveId) => {
  const leave = await prisma.leave.findFirst({ where: { id: leaveId, doctorId } });

  if (!leave) {
    throw createError('Leave record not found.', 404);
  }

  await prisma.leave.delete({ where: { id: leaveId } });
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  addLeave,
  removeLeave,
};
