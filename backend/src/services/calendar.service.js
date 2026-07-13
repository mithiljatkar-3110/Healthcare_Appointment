const { google } = require('googleapis');

const CALENDAR_TIMEZONE = 'UTC';
const REQUIRED_GOOGLE_ENV_VARS = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
];

const getCalendarClient = () => {
  const missingEnvVars = REQUIRED_GOOGLE_ENV_VARS.filter((key) => !process.env[key]);

  if (missingEnvVars.length) {
    console.warn(
      `Google Calendar integration skipped because the following environment variables are missing: ${missingEnvVars.join(', ')}.`,
    );
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

const buildCalendarEventPayload = ({
  appointmentId,
  doctorName,
  patientName,
  symptoms,
  slotStart,
  slotEnd,
}) => ({
  summary: `Healthcare Appointment - Dr. ${doctorName || 'Unknown Doctor'}`,
  description: [
    `Patient Name: ${patientName || 'Unknown Patient'}`,
    `Symptoms: ${symptoms || 'No symptoms provided.'}`,
    `Appointment ID: ${appointmentId}`,
  ].join('\n'),
  start: {
    dateTime: new Date(slotStart).toISOString(),
    timeZone: CALENDAR_TIMEZONE,
  },
  end: {
    dateTime: new Date(slotEnd).toISOString(),
    timeZone: CALENDAR_TIMEZONE,
  },
});

const createAppointmentEvent = async ({
  appointmentId,
  doctorName,
  patientName,
  symptoms,
  slotStart,
  slotEnd,
}) => {
  const calendar = getCalendarClient();

  if (!calendar) {
    return { eventId: null, htmlLink: null };
  }

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: buildCalendarEventPayload({
        appointmentId,
        doctorName,
        patientName,
        symptoms,
        slotStart,
        slotEnd,
      }),
      sendUpdates: 'none',
    });

    return {
      eventId: response?.data?.id || null,
      htmlLink: response?.data?.htmlLink || null,
    };
  } catch (error) {
    console.warn(
      `Google Calendar event creation failed for appointment ${appointmentId}: ${error.message}`,
    );
    return { eventId: null, htmlLink: null };
  }
};

const updateAppointmentEvent = async ({
  appointmentId,
  eventId,
  doctorName,
  patientName,
  symptoms,
  slotStart,
  slotEnd,
}) => {
  const calendar = getCalendarClient();

  if (!calendar || !eventId) {
    return { eventId: null, htmlLink: null };
  }

  try {
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: buildCalendarEventPayload({
        appointmentId,
        doctorName,
        patientName,
        symptoms,
        slotStart,
        slotEnd,
      }),
      sendUpdates: 'none',
    });

    return {
      eventId: response?.data?.id || null,
      htmlLink: response?.data?.htmlLink || null,
    };
  } catch (error) {
    console.warn(
      `Google Calendar event update failed for appointment ${appointmentId} (event ${eventId}): ${error.message}`,
    );
    return { eventId: null, htmlLink: null };
  }
};

const deleteAppointmentEvent = async ({ appointmentId, eventId }) => {
  const calendar = getCalendarClient();

  if (!calendar || !eventId) {
    return false;
  }

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
    return true;
  } catch (error) {
    console.warn(
      `Google Calendar event deletion failed for appointment ${appointmentId} (event ${eventId}): ${error.message}`,
    );
    return false;
  }
};

module.exports = {
  createAppointmentEvent,
  updateAppointmentEvent,
  deleteAppointmentEvent,
};
