const { matchedData, validationResult } = require('express-validator');
const doctorAppointmentService = require('../services/doctor-appointment.service');

const listDoctorAppointments = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.details = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return next(error);
  }

  try {
    const appointments = await doctorAppointmentService.getDoctorAppointments(
      req.user.userId,
      matchedData(req, { locations: ['query'] }),
    );
    return res.status(200).json({ appointments });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listDoctorAppointments };
