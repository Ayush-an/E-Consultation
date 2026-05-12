const { sequelize } = require('../config/db');

// Import model definitions
const User = require('./user.model')(sequelize);
const Doctor = require('./doctor.model')(sequelize);
const Patient = require('./patient.model')(sequelize);
const Consultation = require('./consultation.model')(sequelize);
const MedicalRecord = require('./medicalrecord.model')(sequelize);
const Prescription = require('./prescription.model')(sequelize);
const Slot = require('./slot.model')(sequelize);

// Define User -> Role Specific Relations
User.hasOne(Doctor, { foreignKey: 'user_id' });
Doctor.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Patient, { foreignKey: 'user_id' });
Patient.belongsTo(User, { foreignKey: 'user_id' });

// Consultation Relations
Doctor.hasMany(Consultation, { foreignKey: 'doctor_id' });
Consultation.belongsTo(Doctor, { foreignKey: 'doctor_id' });

Patient.hasMany(Consultation, { foreignKey: 'patient_id' });
Consultation.belongsTo(Patient, { foreignKey: 'patient_id' });

// Consultation <-> Slot
Slot.hasOne(Consultation, { foreignKey: 'slot_id' });
Consultation.belongsTo(Slot, { foreignKey: 'slot_id' });

// Patient <-> Medical Records
Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id' });

// Consultation <-> Prescription
Consultation.hasOne(Prescription, { foreignKey: 'consultation_id' });
Prescription.belongsTo(Consultation, { foreignKey: 'consultation_id' });

// Doctor <-> Slot
Doctor.hasMany(Slot, { foreignKey: 'doctor_id' });
Slot.belongsTo(Doctor, { foreignKey: 'doctor_id' });

// Patient <-> Slot
Patient.hasMany(Slot, { foreignKey: 'patient_id' });
Slot.belongsTo(Patient, { foreignKey: 'patient_id' });

module.exports = {
  sequelize,
  User,
  Doctor,
  Patient,
  Consultation,
  MedicalRecord,
  Prescription,
  Slot,
};
