const { matchedData, validationResult } = require('express-validator');
const adminService = require('../services/admin.service');

const validateRequest = (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.details = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
    throw error;
  }
};

const createDoctor = async (req, res, next) => {
  try {
    validateRequest(req);
    const doctor = await adminService.createDoctor(matchedData(req, { locations: ['body'] }));
    res.status(201).json({ doctor });
  } catch (error) {
    next(error);
  }
};

const listDoctors = async (_req, res, next) => {
  try {
    const doctors = await adminService.getDoctors();
    res.status(200).json({ doctors });
  } catch (error) {
    next(error);
  }
};

const getDoctor = async (req, res, next) => {
  try {
    validateRequest(req);
    const doctor = await adminService.getDoctor(req.params.id);
    res.status(200).json({ doctor });
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    validateRequest(req);
    const { specialization, slotDuration, workingHours } = matchedData(req, { locations: ['body'] });
    const updates = Object.fromEntries(
      Object.entries({ specialization, slotDuration, workingHours }).filter(([, value]) => value !== undefined),
    );
    const doctor = await adminService.updateDoctor(
      req.params.id,
      updates,
    );
    res.status(200).json({ doctor });
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    validateRequest(req);
    await adminService.deleteDoctor(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const addLeave = async (req, res, next) => {
  try {
    validateRequest(req);
    const { leave, affectedAppointmentIds } = await adminService.addLeave(req.params.id, req.body.date);
    res.status(201).json({ leave, affectedAppointmentIds });
  } catch (error) {
    next(error);
  }
};

const removeLeave = async (req, res, next) => {
  try {
    validateRequest(req);
    await adminService.removeLeave(req.params.id, req.params.leaveId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  listDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  addLeave,
  removeLeave,
};
