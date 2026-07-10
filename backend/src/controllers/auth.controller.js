const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

const validateRequest = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.details = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    throw error;
  }
};

const register = async (req, res, next) => {
  try {
    validateRequest(req);
    const user = await authService.registerPatient(req.body);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    validateRequest(req);
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
