const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const slotRoutes = require('./slot.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');
const adminRoutes = require('./admin.routes');

router.use('/auth', authRoutes);
router.use('/slots', slotRoutes);
router.use('/patients', patientRoutes);
router.use('/doctor', doctorRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
