const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const slotRoutes = require('./slot.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');

router.use('/auth', authRoutes);
router.use('/slots', slotRoutes);
router.use('/patients', patientRoutes);
router.use('/doctor', doctorRoutes);

module.exports = router;
