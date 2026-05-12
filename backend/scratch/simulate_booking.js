const { Slot, Patient, User } = require('../src/models');

async function simulateBooking() {
  try {
    const slotId = 'b1a0a966-9966-45d8-bae6-c923debbebed';
    const userId = 'f3f8af32-67e0-4a85-bff1-d378e22b3d58';

    const patient = await Patient.findOne({ where: { user_id: userId } });
    if (!patient) {
      console.log('Patient not found');
      return;
    }

    const slot = await Slot.findByPk(slotId);
    if (!slot) {
      console.log('Slot not found');
      return;
    }

    console.log('Applying updates...');
    slot.is_booked = true;
    slot.patient_id = patient.id;
    slot.status = 'BOOKED';
    
    console.log('Saving slot...');
    await slot.save();
    console.log('Successfully booked!');

  } catch (err) {
    console.error('SIMULATION FAILED:', err);
  } finally {
    process.exit();
  }
}

simulateBooking();
