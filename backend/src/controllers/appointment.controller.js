const { matchedData, validationResult } = require('express-validator');
const appointmentService = require('../services/appointment.service');

const createAppointment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.details = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return next(error);
  }

  try {
    const appointment = await appointmentService.createAppointment(
      matchedData(req, { locations: ['body'] }),
    );
    return res.status(201).json({ appointment });
  } catch (error) {
    return next(error);
  }
};

module.exports = { createAppointment };
