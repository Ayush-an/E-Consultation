const { User, Doctor, Patient, Slot, Consultation, Prescription, MedicalRecord, sequelize } = require('../models');
const { Op } = require('sequelize');

// Helper to generate intervals
const generateIntervals = (start, end, intervalMin) => {
  const parseTime = (t) => {
    const [h, m] = t.split(':');
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  };
  
  const formatTime = (min) => {
    const h = Math.floor(min / 60).toString().padStart(2, '0');
    const m = (min % 60).toString().padStart(2, '0');
    return `${h}:${m}:00`;
  };

  const startMin = parseTime(start);
  const endMin = parseTime(end);
  const slots = [];

  for (let current = startMin; current + intervalMin <= endMin; current += intervalMin) {
    slots.push({
      start_time: formatTime(current),
      end_time: formatTime(current + intervalMin),
      duration_minutes: intervalMin
    });
  }
  return slots;
};

// --- PROFILE ---
exports.getProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
    });
    if (!doctor) return res.status(404).json({ status: 'error', message: 'Doctor profile not found' });
    res.status(200).json({ status: 'success', data: doctor });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { specialization, experience, consultation_fee, bio, avatar_url } = req.body;
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) return res.status(404).json({ status: 'error', message: 'Doctor profile not found' });

    await doctor.update({ specialization, experience, consultation_fee, bio, avatar_url });
    res.status(200).json({ status: 'success', message: 'Profile updated', data: doctor });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- SCHEDULE / SLOTS ---
exports.createSlot = async (req, res) => {
  try {
    const { date, start_time, end_time, duration_minutes } = req.body;
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    
    const slot = await Slot.create({
      doctor_id: doctor.id,
      date,
      start_time,
      end_time,
      duration_minutes: duration_minutes || 20,
      status: 'AVAILABLE'
    });
    res.status(201).json({ status: 'success', data: slot });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.generateSlots = async (req, res) => {
  try {
    const { date, start_time, end_time, interval = 20 } = req.body;
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });

    const intervals = generateIntervals(start_time, end_time, interval);
    const slotsData = intervals.map(inter => ({
      doctor_id: doctor.id,
      date,
      start_time: inter.start_time,
      end_time: inter.end_time,
      duration_minutes: inter.duration_minutes,
      status: 'AVAILABLE'
    }));

    const createdSlots = await Slot.bulkCreate(slotsData);
    res.status(201).json({ status: 'success', count: createdSlots.length, data: createdSlots });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    
    const where = { doctor_id: doctor.id };
    if (date) where.date = date;

    const slots = await Slot.findAll({
      where,
      include: [{ model: Patient, include: [{ model: User, attributes: ['name'] }] }],
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });
    res.status(200).json({ status: 'success', data: slots });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findByPk(id);
    if (!slot) return res.status(404).json({ status: 'error', message: 'Slot not found' });
    if (slot.is_booked) return res.status(400).json({ status: 'error', message: 'Cannot delete booked slot' });

    await slot.destroy();
    res.status(200).json({ status: 'success', message: 'Slot deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- PATIENT QUEUE & CONSULTATIONS ---
exports.getQueue = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    const today = new Date().toLocaleDateString('en-CA');

    console.log(`[Queue] Doctor: ${doctor.id}, Today: ${today}`);
    
    // Fetch all booked slots and filter in JS to be safe with date formats
    const allBookedSlots = await Slot.findAll({
      where: {
        doctor_id: doctor.id,
        is_booked: true,
        status: { [Op.notIn]: ['COMPLETED', 'CANCELLED'] }
      },
      include: [{ model: Patient, include: [{ model: User, attributes: ['name', 'phone'] }] }],
      order: [['start_time', 'ASC']]
    });

    const queue = allBookedSlots.filter(s => s.date === today);
    console.log(`[Queue] Found ${queue.length} slots for today out of ${allBookedSlots.length} total booked`);
    res.status(200).json({ status: 'success', data: queue });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.startConsultation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { slotId } = req.body;
    const slot = await Slot.findByPk(slotId);
    if (!slot) return res.status(404).json({ status: 'error', message: 'Slot not found' });

    await slot.update({ status: 'IN_PROGRESS' }, { transaction: t });

    const consultation = await Consultation.create({
      doctor_id: slot.doctor_id,
      patient_id: slot.patient_id,
      slot_id: slot.id,
      status: 'ACTIVE',
      start_time: new Date(),
      room_id: `room-${slot.id}`
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ status: 'success', data: consultation });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.endConsultation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params; // Consultation ID
    const consultation = await Consultation.findByPk(id);
    if (!consultation) return res.status(404).json({ status: 'error', message: 'Consultation not found' });

    await consultation.update({
      status: 'COMPLETED',
      end_time: new Date()
    }, { transaction: t });

    const slot = await Slot.findByPk(consultation.slot_id);
    if (slot) await slot.update({ status: 'COMPLETED' }, { transaction: t });

    await t.commit();
    res.status(200).json({ status: 'success', message: 'Consultation ended' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- PATIENT DATA ---
exports.getPatients = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    
    // Get unique patients who had consultations with this doctor
    const consultations = await Consultation.findAll({
      where: { doctor_id: doctor.id },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('patient_id')), 'patient_id']],
    });
    
    const patientIds = consultations.map(c => c.patient_id);
    const patients = await Patient.findAll({
      where: { id: patientIds },
      include: [{ model: User, attributes: ['name', 'email', 'phone'] }]
    });

    res.status(200).json({ status: 'success', data: patients });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params; // Patient ID
    const patient = await Patient.findByPk(id, {
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: MedicalRecord },
        { 
          model: Consultation, 
          include: [Prescription],
        }
      ],
      order: [
        [MedicalRecord, 'createdAt', 'DESC'],
        [Consultation, 'createdAt', 'DESC']
      ]
    });
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found' });
    res.status(200).json({ status: 'success', data: patient });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- DOCUMENTATION & CLINICAL SESSIONS ---
exports.getConsultations = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    const list = await Consultation.findAll({
      where: { doctor_id: doctor.id },
      include: [
        { model: Patient, include: [{ model: User, attributes: ['name'] }] },
        { model: Prescription }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const consultation = await Consultation.findByPk(id);
    if (!consultation) return res.status(404).json({ status: 'error', message: 'Consultation not found' });

    await consultation.update({ notes });
    res.status(200).json({ status: 'success', message: 'Notes updated', data: consultation });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- PRESCRIPTIONS ---
exports.createPrescription = async (req, res) => {
  try {
    const { consultation_id, consultationId, diagnosis, medicines, notes } = req.body;
    const prescription = await Prescription.create({
      consultation_id: consultation_id || consultationId,
      diagnosis,
      medicines,
      notes
    });
    res.status(201).json({ status: 'success', data: prescription });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    const list = await Prescription.findAll({
      include: [{
        model: Consultation,
        where: { doctor_id: doctor.id },
        include: [{ model: Patient, include: [{ model: User, attributes: ['name'] }] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ status: 'success', data: list });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- DASHBOARD STATS ---
exports.getStats = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    const today = new Date().toLocaleDateString('en-CA');

    console.log(`[Stats] Doctor: ${doctor.id}, Today: ${today}`);
    const totalPatients = await Consultation.count({
      where: { doctor_id: doctor.id, status: 'COMPLETED' },
      distinct: true,
      col: 'patient_id'
    });

    const allBookedSlots = await Slot.findAll({
      where: { doctor_id: doctor.id, is_booked: true }
    });
    
    const todayAppointments = allBookedSlots.filter(s => s.date === today).length;
    const pendingConsultations = allBookedSlots.filter(s => s.date === today && s.status === 'BOOKED').length;

    console.log(`[Stats] Today Appts: ${todayAppointments}`);

    res.status(200).json({
      status: 'success',
      data: {
        totalPatients,
        todayAppointments,
        pendingConsultations,
        experience: doctor.experience,
        specialization: doctor.specialization
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
// --- SCHEDULE HISTORY ---
exports.getScheduleHistory = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    if (!doctor) return res.status(404).json({ status: 'error', message: 'Doctor not found' });

    const history = await Slot.findAll({
      where: {
        doctor_id: doctor.id,
        [Op.or]: [
          { status: 'COMPLETED' },
          { 
            [Op.and]: [
              { date: { [Op.lt]: new Date().toISOString().split('T')[0] } },
              { is_booked: true }
            ]
          }
        ]
      },
      include: [
        {
          model: Patient,
          include: [
            { model: User, attributes: ['name', 'email', 'phone'] },
            { model: MedicalRecord }
          ]
        },
        {
          model: Consultation,
          include: [Prescription]
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    });

    res.status(200).json({ status: 'success', data: history });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- NEW: CALENDAR OVERVIEW ---
exports.getCalendarOverview = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    const { start, end } = req.query; // Expecting YYYY-MM-DD

    const slots = await Slot.findAll({
      where: {
        doctor_id: doctor.id,
        date: { [Op.between]: [start, end] }
      },
      attributes: ['date', 'is_booked', 'status']
    });

    // Group by date and count
    const overview = slots.reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = { total: 0, booked: 0, completed: 0 };
      acc[slot.date].total++;
      if (slot.is_booked) acc[slot.date].booked++;
      if (slot.status === 'COMPLETED') acc[slot.date].completed++;
      return acc;
    }, {});

    res.status(200).json({ status: 'success', data: overview });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- NEW: SLOTS BY DATE ---
exports.getSlotsByDate = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { user_id: req.user.id } });
    const { date } = req.query;

    const slots = await Slot.findAll({
      where: { doctor_id: doctor.id, date },
      include: [
        {
          model: Patient,
          include: [
            { model: User, attributes: ['name', 'email', 'phone'] },
            { model: MedicalRecord }
          ]
        },
        {
          model: Consultation,
          include: [Prescription]
        }
      ],
      order: [['start_time', 'ASC']]
    });

    res.status(200).json({ status: 'success', data: slots });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
