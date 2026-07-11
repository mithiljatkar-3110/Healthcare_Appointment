const { Router } = require('express');
const { param, query } = require('express-validator');
const { getDoctorSlots } = require('../controllers/slot.controller');

const router = Router();

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
  '/:doctorId/slots',
  [
    param('doctorId').isUUID().withMessage('Doctor ID must be a UUID.'),
    query('date').custom(validDate),
  ],
  getDoctorSlots,
);

module.exports = router;
