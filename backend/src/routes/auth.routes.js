const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/mobile-login', authController.mobileLogin);
router.post('/doctor-mobile-login', authController.mobileLogin);
router.post('/doctor-register', authController.doctorRegister);
router.post('/doctor-login', authController.doctorLogin);
router.post('/admin-login', authController.adminLogin);

module.exports = router;
