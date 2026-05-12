const { User, Patient, MedicalRecord, Doctor, Slot, Consultation, Prescription } = require('../models');
const { Op } = require('sequelize');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Patient }]
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.saveIntake = async (req, res) => {
  try {
    const { symptoms, history, reports, age, gender, address } = req.body;
    
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient profile not found' });
    }

    // Update patient profile info if provided
    await patient.update({ age, gender, address });

    // Create medical record (intake form)
    const record = await MedicalRecord.create({
      patient_id: patient.id,
      symptoms,
      history,
      reports,
      organization_id: patient.organization_id
    });

    res.status(201).json({ status: 'success', data: record });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getIntakeStatus = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(200).json({ status: 'success', data: { completed: false } });
    }

    const record = await MedicalRecord.findOne({ where: { patient_id: patient.id } });
    res.status(200).json({ status: 'success', data: { completed: !!record } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getIntakeHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient not found' });
    }

    const records = await MedicalRecord.findAll({
      where: { patient_id: patient.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ status: 'success', data: records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No image file uploaded.' });
    }

    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient profile not found.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await patient.update({ avatar_url: avatarUrl });

    res.status(200).json({
      status: 'success',
      message: 'Avatar updated successfully',
      data: { avatar_url: avatarUrl }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    res.status(200).json({ status: 'success', data: doctors });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found' });

    const upcomingSessions = await Slot.findAll({
      where: {
        patient_id: patient.id,
        is_booked: true,
        status: 'BOOKED',
        date: { [Op.gte]: new Date().toISOString().split('T')[0] }
      },
      include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }],
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });

    const prescriptions = await Prescription.findAll({
      include: [{
        model: Consultation,
        where: { patient_id: patient.id },
        include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        upcomingSessions,
        prescriptions,
        totalAppointments: upcomingSessions.length,
        totalPrescriptions: prescriptions.length
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
