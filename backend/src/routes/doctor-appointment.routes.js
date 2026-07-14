const { Router } = require('express');
const { query } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { listDoctorAppointments } = require('../controllers/doctor-appointment.controller');

const router = Router();
const appointmentStatuses = ['BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('date must use YYYY-MM-DD format.');
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('date must be a valid calendar date.');
  }

  return true;
};

router.get(
  '/appointments',
  authenticate,
  authorize('DOCTOR'),
  [
    query('status').optional().isIn(appointmentStatuses).withMessage('status must be a valid appointment status.'),
    query('date').optional().custom(validDate),
    query('search').optional().trim().isLength({ min: 1, max: 200 }).withMessage('search must be between 1 and 200 characters.'),
  ],
  listDoctorAppointments,
);

module.exports = router;
