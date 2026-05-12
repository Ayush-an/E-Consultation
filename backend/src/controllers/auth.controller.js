const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Doctor, Patient } = require('../models');
const logger = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, organization_id: user.organization_id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, phone, email, password, dob, role, gender } = req.body;
    
    if (!phone) {
      return res.status(400).json({ status: 'error', message: 'Phone number is required' });
    }

    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Phone number already registered' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    
    const user = await User.create({
      name,
      email: email || null,
      phone,
      password: hashedPassword,
      role: role || 'PATIENT'
    });

    // Optionally create linked Doctor or Patient profiles right away
    if (user.role === 'DOCTOR') {
      await Doctor.create({ user_id: user.id, specialization: 'General' }); // Default values until setup
    } else if (user.role === 'PATIENT') {
      await Patient.create({ user_id: user.id, dob: dob || null, phone, gender: gender || null });
    }

    const token = generateToken(user);
    logger.success(`New user registered: ${user.phone} (${user.role})`, 'AUTH');
    res.status(201).json({ status: 'success', data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (error) {
    logger.error('Registration failed', error, 'AUTH');
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
       return res.status(400).json({ status: 'error', message: 'Phone and password are required' });
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const token = generateToken(user);
    logger.success(`User logged in: ${user.phone}`, 'AUTH');
    res.status(200).json({ status: 'success', data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (error) {
    logger.error('Login failed', error, 'AUTH');
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.mobileLogin = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ status: 'error', message: 'Phone number is required' });
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized. User not found.' });
    }

    const token = generateToken(user);
    res.status(200).json({ 
      status: 'success', 
      data: { 
        user: { id: user.id, name: user.name, email: user.email, role: user.role }, 
        token 
      } 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Doctor Corner — Registration (email + password)
exports.doctorRegister = async (req, res) => {
  try {
    logger.info(`Doctor registration attempt: ${JSON.stringify(req.body)}`, 'AUTH');
    const { name, email, phone, password, specialization, experience } = req.body;

    if (!name || !email || !phone || !password) {
      logger.warn(`Doctor registration failed: Missing fields - Name: ${!!name}, Email: ${!!email}, Phone: ${!!phone}, Password: ${!!password}`, 'AUTH');
      return res.status(400).json({ status: 'error', message: 'Name, email, phone, and password are required.' });
    }

    // Check existing by email or phone
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      logger.warn(`Doctor registration failed: Email already exists - ${email}`, 'AUTH');
      return res.status(400).json({ status: 'error', message: 'Email already registered.' });
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      logger.warn(`Doctor registration failed: Phone already exists - ${phone}`, 'AUTH');
      return res.status(400).json({ status: 'error', message: 'Phone number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'DOCTOR',
    });

    await Doctor.create({
      user_id: user.id,
      specialization: specialization || 'General',
      experience: parseInt(experience) || 0,
    });

    const token = generateToken(user);
    res.status(201).json({
      status: 'success',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Doctor Corner — Login (email + password)
exports.doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    if (user.role !== 'DOCTOR') {
      return res.status(403).json({ status: 'error', message: 'Access denied. Not a doctor account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    res.status(200).json({
      status: 'success',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
