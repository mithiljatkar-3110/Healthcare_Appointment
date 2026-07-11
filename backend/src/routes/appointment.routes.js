const { Router } = require('express');
const { body } = require('express-validator');
const { createAppointment } = require('../controllers/appointment.controller');

const router = Router();

const isUtcDateTime = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) {
    throw new Error('slotStart must be an ISO 8601 UTC datetime.');
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value.slice(0, 10)) {
    throw new Error('slotStart must be a valid datetime.');
  }

  return true;
};

router.post(
  '/',
  [
    body('doctorId').isUUID().withMessage('doctorId must be a UUID.'),
    body('patientId').isUUID().withMessage('patientId must be a UUID.'),
    body('slotStart').custom(isUtcDateTime),
    body('symptoms').optional({ nullable: true }).trim().isLength({ max: 5_000 }).withMessage('symptoms must not exceed 5000 characters.'),
  ],
  createAppointment,
);

module.exports = router;
