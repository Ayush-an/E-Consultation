const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    medicines: {
      type: DataTypes.JSON, // Stores array of medicine objects { name, dosage, duration, instructions }
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  return Prescription;
};
