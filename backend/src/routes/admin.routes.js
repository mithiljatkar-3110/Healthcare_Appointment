const { Router } = require('express');
const { body, param } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = Router();

const validateWorkingHours = (value) => {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error('workingHours must be an object keyed by weekday.');
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  for (const [day, hours] of Object.entries(value)) {
    if (!/^(mon|tue|wed|thu|fri|sat|sun)$/.test(day) || !Array.isArray(hours) || hours.length !== 2) {
      throw new Error('workingHours must use weekday keys with [startTime, endTime] values.');
    }

    if (!hours.every((time) => typeof time === 'string' && timePattern.test(time)) || hours[0] >= hours[1]) {
      throw new Error('Each working-hours range must contain valid start and end times.');
    }
  }

  return true;
};

const validateDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Date must use YYYY-MM-DD format.');
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('Date must be a valid calendar date.');
  }

  return true;
};

const doctorId = () => param('id').isUUID().withMessage('Doctor ID must be a UUID.');
const leaveId = () => param('leaveId').isUUID().withMessage('Leave ID must be a UUID.');
const email = body('email').isEmail().withMessage('A valid email address is required.').normalizeEmail();
const specialization = body('specialization')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Specialization must be between 2 and 100 characters.');
const slotDuration = body('slotDuration')
  .isInt({ min: 5, max: 480 })
  .withMessage('slotDuration must be between 5 and 480 minutes.')
  .toInt();
const workingHours = body('workingHours').custom(validateWorkingHours);

router.use(authenticate, authorize('ADMIN'));

router.post(
  '/doctors',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters.'),
    email,
    body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters.'),
    specialization,
    slotDuration,
    workingHours,
  ],
  adminController.createDoctor,
);

router.get('/doctors', adminController.listDoctors);
router.get('/doctors/:id', [doctorId()], adminController.getDoctor);
router.put(
  '/doctors/:id',
  [
    doctorId(),
    body('specialization').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Specialization must be between 2 and 100 characters.'),
    body('slotDuration').optional().isInt({ min: 5, max: 480 }).withMessage('slotDuration must be between 5 and 480 minutes.').toInt(),
    body('workingHours').optional().custom(validateWorkingHours),
    body().custom((_, { req }) => {
      if (req.body.specialization === undefined && req.body.slotDuration === undefined && req.body.workingHours === undefined) {
        throw new Error('Provide at least one doctor field to update.');
      }
      return true;
    }),
  ],
  adminController.updateDoctor,
);
router.delete('/doctors/:id', [doctorId()], adminController.deleteDoctor);
router.post('/doctors/:id/leaves', [doctorId(), body('date').custom(validateDate)], adminController.addLeave);
router.delete('/doctors/:id/leaves/:leaveId', [doctorId(), leaveId()], adminController.removeLeave);

module.exports = router;
