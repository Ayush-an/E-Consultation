const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// All doctor routes require auth and DOCTOR role
router.use(auth);
router.use(role('DOCTOR'));

// Profile
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);

// Slots / Schedule
router.get('/slots', doctorController.getSlots);
router.post('/slots', doctorController.createSlot);
router.post('/slots/generate', doctorController.generateSlots);
router.delete('/slots/:id', doctorController.deleteSlot);

// Queue & Active Consultations
router.get('/queue', doctorController.getQueue);
router.post('/queue/start', doctorController.startConsultation);
router.post('/queue/:id/end', doctorController.endConsultation);

// Patient Data
router.get('/patients', doctorController.getPatients);
router.get('/patients/:id', doctorController.getPatientDetails);

// Clinical Sessions / Consultations
router.get('/consultations', doctorController.getConsultations);
router.put('/consultations/:id/notes', doctorController.updateNotes);

// Prescriptions
router.get('/prescriptions', doctorController.getPrescriptions);
router.post('/prescriptions', doctorController.createPrescription);

// Dashboard Stats
router.get('/stats', doctorController.getStats);

// Schedule History
router.get('/schedule-history', doctorController.getScheduleHistory);
router.get('/calendar-overview', doctorController.getCalendarOverview);
router.get('/slots-by-date', doctorController.getSlotsByDate);

module.exports = router;
