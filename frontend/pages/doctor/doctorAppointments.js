import api from '../../api/api';

export const getDoctorAppointments = async (params = {}) => {
  const response = await api.get('/doctor/appointments', { params });
  return Array.isArray(response.data?.appointments) ? response.data.appointments : [];
};

export const currentDate = () => new Date().toISOString().slice(0, 10);
