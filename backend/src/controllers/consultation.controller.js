const { matchedData, validationResult } = require('express-validator');
const consultationService = require('../services/consultation.service');

const saveConsultation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.details = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    return next(error);
  }

  try {
    const { clinicalNotes, prescription } = matchedData(req, { locations: ['body'] });
    const appointment = await consultationService.saveConsultation(
      req.params.appointmentId,
      req.user.userId,
      { clinicalNotes, prescription },
    );
    return res.status(200).json({ appointment });
  } catch (error) {
    return next(error);
  }
};

module.exports = { saveConsultation };
