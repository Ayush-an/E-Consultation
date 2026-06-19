import api from './api';

const unwrap = (res) => res.data.data;

export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(unwrap),
  getDashboardCharts: (period) => api.get('/admin/dashboard/charts', { params: { period } }).then(unwrap),
  getRealtimeStats: () => api.get('/admin/dashboard/realtime').then(unwrap),
  getRecentActivity: () => api.get('/admin/dashboard/activity').then(unwrap),
  getNotifications: () => api.get('/admin/dashboard/notifications').then(unwrap),
  getGeoAnalytics: () => api.get('/admin/dashboard/geo').then(unwrap),

  getUsers: (params) => api.get('/admin/users', { params }).then(unwrap),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }).then(unwrap),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(unwrap),

  getDoctors: (params) => api.get('/admin/doctors', { params }).then(unwrap),
  updateDoctorStatus: (id, action) => api.put(`/admin/doctors/${id}/status`, { action }).then(unwrap),

  getClinics: (params) => api.get('/admin/clinics', { params }).then(unwrap),
  updateClinicStatus: (id, action) => api.put(`/admin/clinics/${id}/status`, { action }).then(unwrap),

  getConsultations: (params) => api.get('/admin/consultations', { params }).then(unwrap),
  getAppointments: (params) => api.get('/admin/appointments', { params }).then(unwrap),

  getRevenue: () => api.get('/admin/revenue').then(unwrap),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }).then(unwrap),
  getRoles: () => api.get('/admin/roles').then(unwrap),
  getSettings: () => api.get('/admin/settings').then(unwrap),
  updateSettings: (data) => api.put('/admin/settings', data).then(unwrap),

  getEHRRecords: () => api.get('/admin/ehr/records').then(unwrap),
  getPrescriptions: () => api.get('/admin/ehr/prescriptions').then(unwrap),
};

export const authApi = {
  adminLogin: (email, password) =>
    api.post('/auth/admin-login', { email, password }).then((res) => res.data.data),
};
