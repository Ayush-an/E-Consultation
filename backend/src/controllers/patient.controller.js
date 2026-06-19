const { User, Patient, MedicalRecord, Doctor, Slot, Consultation, Prescription } = require('../models');
const { Op } = require('sequelize');

const DEFAULT_CATEGORIES = [
  'General', 'Cardiology', 'Dermatology', 'Pediatrics',
  'Orthopedics', 'Neurology', 'Gynecology', 'Psychiatry', 'ENT', 'Dentistry',
];

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
    const { specialization } = req.query;
    const where = {};
    if (specialization) {
      where.specialization = { [Op.like]: `%${specialization}%` };
    }
    const doctors = await Doctor.findAll({
      where,
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ status: 'success', data: doctors });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getDoctorCategories = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({ attributes: ['specialization'] });
    const fromDb = [...new Set(doctors.map((d) => d.specialization).filter(Boolean))];
    const categories = [...new Set([...DEFAULT_CATEGORIES, ...fromDb])].sort();
    const withCounts = categories.map((name) => ({
      name,
      count: doctors.filter((d) => {
        const spec = (d.specialization || '').toLowerCase();
        const cat = name.toLowerCase();
        return spec === cat || spec.includes(cat) || cat.includes(spec);
      }).length,
    }));
    res.status(200).json({ status: 'success', data: withCounts });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getMedicalRecords = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(200).json({ status: 'success', data: [] });
    }
    const records = await MedicalRecord.findAll({
      where: { patient_id: patient.id },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ status: 'success', data: records });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.uploadDocumentFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
    }
    res.status(200).json({
      status: 'success',
      data: {
        name: req.body.title || req.file.originalname,
        url: `/uploads/documents/${req.file.filename}`,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.uploadMedicalDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
    }

    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient profile not found.' });
    }

    const { title, symptoms, notes } = req.body;
    const fileEntry = {
      name: title || req.file.originalname,
      url: `/uploads/documents/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
    };

    const record = await MedicalRecord.create({
      patient_id: patient.id,
      symptoms: symptoms || title || 'Uploaded medical document',
      history: notes ? JSON.stringify({ notes }) : null,
      reports: [fileEntry],
      organization_id: patient.organization_id,
    });

    res.status(201).json({ status: 'success', data: record, message: 'Document uploaded successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) {
      return res.status(200).json({ status: 'success', data: [] });
    }

    const consultations = await Consultation.findAll({
      where: { patient_id: patient.id },
      attributes: ['id'],
    });
    const consultationIds = consultations.map((c) => c.id);

    if (consultationIds.length === 0) {
      return res.status(200).json({ status: 'success', data: [] });
    }

    const prescriptions = await Prescription.findAll({
      where: { consultation_id: { [Op.in]: consultationIds } },
      include: [{
        model: Consultation,
        include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ status: 'success', data: prescriptions });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getConsultationBySlot = async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { user_id: req.user.id } });
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found' });

    let consultation = await Consultation.findOne({
      where: { slot_id: req.params.slotId, patient_id: patient.id },
      include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }],
    });

    if (!consultation) {
      const slot = await Slot.findByPk(req.params.slotId);
      if (!slot || slot.patient_id !== patient.id) {
        return res.status(404).json({ status: 'error', message: 'Consultation not found' });
      }
      consultation = await Consultation.create({
        doctor_id: slot.doctor_id,
        patient_id: patient.id,
        slot_id: slot.id,
        status: 'PENDING',
        room_id: `room-${slot.id}`,
      });
    }

    res.status(200).json({ status: 'success', data: consultation });
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

    const consultationIds = (await Consultation.findAll({
      where: { patient_id: patient.id },
      attributes: ['id'],
    })).map((c) => c.id);

    const prescriptions = consultationIds.length > 0
      ? await Prescription.findAll({
          where: { consultation_id: { [Op.in]: consultationIds } },
          include: [{
            model: Consultation,
            include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }],
          }],
          order: [['createdAt', 'DESC']],
        })
      : [];

    const medicalRecords = await MedicalRecord.findAll({
      where: { patient_id: patient.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    res.status(200).json({
      status: 'success',
      data: {
        upcomingSessions,
        prescriptions,
        medicalRecords,
        totalAppointments: upcomingSessions.length,
        totalPrescriptions: prescriptions.length,
        totalRecords: medicalRecords.length,
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
