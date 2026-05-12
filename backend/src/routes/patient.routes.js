const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/me', auth, patientController.getProfile);
router.post('/intake', auth, patientController.saveIntake);
router.get('/intake-status', auth, patientController.getIntakeStatus);
router.get('/intake-history', auth, patientController.getIntakeHistory);
router.get('/doctors', auth, patientController.getDoctors);
router.get('/dashboard', auth, patientController.getDashboardData);
router.post('/avatar', auth, upload.single('avatar'), patientController.updateAvatar);

module.exports = router;
