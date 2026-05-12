const { Slot, Patient, Doctor } = require('../models');
const logger = require('../utils/logger');

// Extract times and manipulate them for interval generation
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
      end_time: formatTime(current + intervalMin)
    });
  }
  return slots;
};

exports.createSlots = async (req, res) => {
  try {
    const { date, start_time, end_time, interval = 20 } = req.body;
    const userId = req.user.id;
    
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields for slot generation' });
    }

    const doctor = await Doctor.findOne({ where: { user_id: userId } });
    if (!doctor) {
      logger.warn(`Doctor profile not found for user ${userId}`, 'SLOT_GEN');
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const intervals = generateIntervals(start_time, end_time, interval);
    const slotsData = intervals.map(inter => ({
      doctor_id: doctor.id,
      date,
      start_time: inter.start_time,
      end_time: inter.end_time,
      is_booked: false
    }));

    const createdSlots = await Slot.bulkCreate(slotsData);
    logger.success(`Generated ${createdSlots.length} slots for doctor ${doctor.id}`, 'SLOT_GEN');
    res.status(201).json({ message: 'Slots generated successfully', count: createdSlots.length, slots: createdSlots });
  } catch (error) {
    logger.error('Server error generating slots', error, 'SLOT_GEN');
    res.status(500).json({ error: 'Server error generating slots', details: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctor_id, date } = req.query;
    if (!doctor_id || !date) {
      return res.status(400).json({ error: 'Doctor ID and Date are required' });
    }

    const slots = await Slot.findAll({
      where: {
        doctor_id,
        date,
        is_booked: false
      },
      order: [['start_time', 'ASC']]
    });

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching slots', details: error.message });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const { id } = req.params;

    logger.info(`Booking attempt - Slot: ${id}, User: ${userId}`, 'BOOKING');

    const patient = await Patient.findOne({ where: { user_id: userId } });
    if (!patient) {
      logger.warn(`Patient profile not found for user ${userId}`, 'BOOKING');
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const slot = await Slot.findByPk(id);
    if (!slot) {
      logger.warn(`Slot ${id} not found`, 'BOOKING');
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    if (slot.is_booked) {
      logger.warn(`Slot ${id} is already booked`, 'BOOKING');
      return res.status(400).json({ error: 'Slot is already booked' });
    }

    // Use update for atomic-like operation
    await slot.update({
      is_booked: true,
      patient_id: patient.id,
      status: 'BOOKED'
    });

    logger.success(`Slot ${id} successfully booked for patient ${patient.id}`, 'BOOKING');
    res.status(200).json({ message: 'Slot successfully booked', slot });
  } catch (error) {
    logger.error('Error in bookSlot', error, 'BOOKING');
    res.status(500).json({ 
      error: 'Server error booking slot', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};
