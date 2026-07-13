const prisma = require('../config/db');
const { sendEmail } = require('./email.service');

const appointmentInclude = {
  doctor: {
    select: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
  patient: {
    select: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
};

const formatUtcDateTime = (value) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));

const createNotificationLog = async (appointmentId, notificationType) => {
  try {
    return await prisma.notificationLog.create({
      data: {
        appointmentId,
        notificationType,
        status: 'PENDING',
      },
    });
  } catch (error) {
    console.error(`Unable to create NotificationLog for appointment ${appointmentId}:`, error.message);
    return null;
  }
};

const updateNotificationLog = async (id, status, errorMessage = null) => {
  if (!id) {
    return;
  }

  try {
    await prisma.notificationLog.update({
      where: { id },
      data: {
        status,
        retryCount: 0,
        lastError: errorMessage,
      },
    });
  } catch (error) {
    console.error(`Unable to update NotificationLog ${id}:`, error.message);
  }
};

const loadAppointment = async (appointmentId) =>
  prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: appointmentInclude,
  });

const sendNotification = async ({
  appointmentId,
  notificationType,
  subject,
  text,
  html,
}) => {
  const appointment = await loadAppointment(appointmentId);

  if (!appointment) {
    console.error(`Notification skipped because appointment ${appointmentId} was not found.`);
    return { success: false, error: 'Appointment not found.' };
  }

  const patientEmail = appointment.patient?.user?.email;
  if (!patientEmail) {
    const log = await createNotificationLog(appointmentId, notificationType);
    await updateNotificationLog(log?.id, 'FAILED', 'Patient email address not found.');
    return { success: false, error: 'Patient email address not found.' };
  }

  const log = await createNotificationLog(appointmentId, notificationType);
  const emailResult = await sendEmail({
    to: patientEmail,
    subject,
    text,
    html,
  });

  if (emailResult.success) {
    await updateNotificationLog(log?.id, 'SENT');
    return { success: true };
  }

  await updateNotificationLog(log?.id, 'FAILED', emailResult.error);
  return { success: false, error: emailResult.error };
};

const sendBookingConfirmation = async (appointmentId, { calendarHtmlLink = null } = {}) => {
  const appointment = await loadAppointment(appointmentId);

  if (!appointment) {
    console.error(`Booking confirmation skipped because appointment ${appointmentId} was not found.`);
    return { success: false, error: 'Appointment not found.' };
  }

  const doctorName = appointment.doctor?.user?.name || 'your doctor';
  const patientName = appointment.patient?.user?.name || 'Patient';
  const appointmentDate = formatUtcDateTime(appointment.slotStart);
  const calendarLinkHtml = calendarHtmlLink
    ? `
      <p>
        Google Calendar link:
        <a href="${calendarHtmlLink}" target="_blank" rel="noopener noreferrer">Open event</a>
      </p>
    `
    : '';

  return sendNotification({
    appointmentId,
    notificationType: 'BOOKING',
    subject: 'Appointment booking confirmed',
    text: `Hello ${patientName},\n\nYour appointment with ${doctorName} has been booked for ${appointmentDate}.${calendarHtmlLink ? `\n\nGoogle Calendar link: ${calendarHtmlLink}` : ''}`,
    html: `
      <p>Hello ${patientName},</p>
      <p>Your appointment with ${doctorName} has been booked for <strong>${appointmentDate}</strong>.</p>
      ${calendarLinkHtml}
    `,
  });
};

const sendAppointmentReminder = async (appointmentId) => {
  const appointment = await loadAppointment(appointmentId);

  if (!appointment) {
    console.error(`Reminder skipped because appointment ${appointmentId} was not found.`);
    return { success: false, error: 'Appointment not found.' };
  }

  const doctorName = appointment.doctor?.user?.name || 'your doctor';
  const patientName = appointment.patient?.user?.name || 'Patient';
  const appointmentDate = formatUtcDateTime(appointment.slotStart);

  return sendNotification({
    appointmentId,
    notificationType: 'REMINDER',
    subject: 'Appointment reminder',
    text: `Hello ${patientName},\n\nThis is a reminder that your appointment with ${doctorName} is scheduled for ${appointmentDate}.`,
    html: `
      <p>Hello ${patientName},</p>
      <p>This is a reminder that your appointment with ${doctorName} is scheduled for <strong>${appointmentDate}</strong>.</p>
    `,
  });
};

const sendCancellation = async (appointmentId) => {
  const appointment = await loadAppointment(appointmentId);

  if (!appointment) {
    console.error(`Cancellation notice skipped because appointment ${appointmentId} was not found.`);
    return { success: false, error: 'Appointment not found.' };
  }

  const doctorName = appointment.doctor?.user?.name || 'your doctor';
  const patientName = appointment.patient?.user?.name || 'Patient';
  const appointmentDate = formatUtcDateTime(appointment.slotStart);

  return sendNotification({
    appointmentId,
    notificationType: 'CANCELLATION',
    subject: 'Appointment cancellation notice',
    text: `Hello ${patientName},\n\nYour appointment with ${doctorName} on ${appointmentDate} has been cancelled.`,
    html: `
      <p>Hello ${patientName},</p>
      <p>Your appointment with ${doctorName} on <strong>${appointmentDate}</strong> has been cancelled.</p>
    `,
  });
};

const sendDoctorLeaveNotification = async (appointmentIds) => {
  const ids = Array.isArray(appointmentIds) ? appointmentIds : [appointmentIds];

  if (!ids.length) {
    return { sent: 0, failed: 0 };
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      id: { in: ids },
    },
    include: appointmentInclude,
  });

  let sent = 0;
  let failed = 0;

  for (const appointment of appointments) {
    const doctorName = appointment.doctor?.user?.name || 'the doctor';
    const patientName = appointment.patient?.user?.name || 'Patient';
    const appointmentDate = formatUtcDateTime(appointment.slotStart);

    const result = await sendNotification({
      appointmentId: appointment.id,
      notificationType: 'LEAVE',
      subject: 'Doctor leave notification',
      text: `Hello ${patientName},\n\n${doctorName} is on leave for ${appointmentDate}. Your appointment has been affected.`,
      html: `
        <p>Hello ${patientName},</p>
        <p>${doctorName} is on leave for <strong>${appointmentDate}</strong>. Your appointment has been affected.</p>
      `,
    });

    if (result.success) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return { sent, failed };
};

module.exports = {
  sendBookingConfirmation,
  sendAppointmentReminder,
  sendCancellation,
  sendDoctorLeaveNotification,
};
