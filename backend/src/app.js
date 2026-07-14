const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const consultationRoutes = require('./routes/consultation.routes');
const doctorAppointmentRoutes = require('./routes/doctor-appointment.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  
  ...((process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean)),
];

app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header are health checks or server-to-server calls.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed.'));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/appointments', consultationRoutes);
app.use('/api/doctor', doctorAppointmentRoutes);

app.use(errorHandler);

module.exports = app;
