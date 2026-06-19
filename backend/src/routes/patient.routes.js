const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const documentUpload = require('../middleware/documentUpload.middleware');

router.get('/me', auth, patientController.getProfile);
router.post('/intake', auth, patientController.saveIntake);
router.get('/intake-status', auth, patientController.getIntakeStatus);
router.get('/intake-history', auth, patientController.getIntakeHistory);
router.get('/medical-records', auth, patientController.getMedicalRecords);
router.post('/documents/upload', auth, documentUpload.single('document'), patientController.uploadDocumentFile);
router.post('/medical-records/upload', auth, documentUpload.single('document'), patientController.uploadMedicalDocument);
router.get('/prescriptions', auth, patientController.getPrescriptions);
router.get('/doctor-categories', auth, patientController.getDoctorCategories);
router.get('/doctors', auth, patientController.getDoctors);
router.get('/consultation/slot/:slotId', auth, patientController.getConsultationBySlot);
router.get('/dashboard', auth, patientController.getDashboardData);
router.post('/avatar', auth, upload.single('avatar'), patientController.updateAvatar);

module.exports = router;
