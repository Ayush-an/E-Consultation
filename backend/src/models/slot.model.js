const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Slot = sequelize.define('Slot', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
    },
    is_booked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'BOOKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'AVAILABLE',
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['doctor_id'] },
      { fields: ['patient_id'] },
      { fields: ['date'] },
      { fields: ['status'] },
    ]
  });

  return Slot;
};
