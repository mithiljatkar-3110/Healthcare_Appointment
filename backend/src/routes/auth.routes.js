const { Router } = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/auth.controller');

const router = Router();

const emailValidation = () =>
  body('email')
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters.'),
    emailValidation(),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters.'),
  ],
  register,
);

router.post(
  '/login',
  [
    emailValidation(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  login,
);

module.exports = router;
