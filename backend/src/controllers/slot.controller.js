const { validationResult } = require('express-validator');
const slotService = require('../services/slot.service');

const getDoctorSlots = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.details = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return next(error);
  }

  try {
    const slots = await slotService.getSlots(req.params.doctorId, req.query.date);
    return res.status(200).json(slots);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDoctorSlots };
