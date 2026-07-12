const { Router } = require('express');
const { body, param } = require('express-validator');
const { saveConsultation } = require('../controllers/consultation.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = Router();

router.put(
  '/:appointmentId/consultation',
  authenticate,
  authorize('DOCTOR'),
  [
    param('appointmentId').isUUID().withMessage('Appointment ID must be a UUID.'),
    body('clinicalNotes')
      .trim()
      .isLength({ min: 1, max: 10_000 })
      .withMessage('clinicalNotes must be between 1 and 10000 characters.'),
    body('prescription').isObject().withMessage('prescription must be an object.'),
    body('prescription.medicines').isArray({ min: 1 }).withMessage('prescription.medicines must contain at least one medicine.'),
    body('prescription.medicines.*.name').trim().isLength({ min: 1, max: 200 }).withMessage('Medicine name is required.'),
    body('prescription.medicines.*.dosage').trim().isLength({ min: 1, max: 100 }).withMessage('Medicine dosage is required.'),
    body('prescription.medicines.*.frequency').trim().isLength({ min: 1, max: 100 }).withMessage('Medicine frequency is required.'),
    body('prescription.medicines.*.days').isInt({ min: 1, max: 365 }).withMessage('Medicine days must be between 1 and 365.').toInt(),
  ],
  saveConsultation,
);

module.exports = router;
