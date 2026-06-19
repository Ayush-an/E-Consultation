// admin.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const admin = require('../controllers/admin.controller');

const adminAuth = [auth, role('SUPERADMIN', 'ADMIN')];

router.get('/dashboard/stats', adminAuth, admin.getDashboardStats);
router.get('/dashboard/charts', adminAuth, admin.getDashboardCharts);
router.get('/dashboard/realtime', adminAuth, admin.getRealtimeStats);
router.get('/dashboard/activity', adminAuth, admin.getRecentActivity);
router.get('/dashboard/notifications', adminAuth, admin.getNotifications);
router.get('/dashboard/geo', adminAuth, admin.getGeoAnalytics);

router.get('/users', adminAuth, admin.getUsers);
router.put('/users/:id/status', adminAuth, admin.updateUserStatus);
router.delete('/users/:id', adminAuth, admin.deleteUser);

router.get('/doctors', adminAuth, admin.getDoctors);
router.put('/doctors/:id/status', adminAuth, admin.updateDoctorStatus);

router.get('/clinics', adminAuth, admin.getClinics);
router.put('/clinics/:id/status', adminAuth, admin.updateClinicStatus);

router.get('/consultations', adminAuth, admin.getConsultations);
router.get('/appointments', adminAuth, admin.getAppointments);

router.get('/revenue', adminAuth, admin.getRevenue);
router.get('/audit-logs', adminAuth, admin.getAuditLogs);
router.get('/roles', adminAuth, admin.getRoles);
router.get('/settings', adminAuth, admin.getSettings);
router.put('/settings', adminAuth, admin.updateSettings);

router.get('/ehr/records', adminAuth, admin.getEHRRecords);
router.get('/ehr/prescriptions', adminAuth, admin.getPrescriptions);

module.exports = router;
