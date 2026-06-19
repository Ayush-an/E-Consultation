require('dotenv').config();
const db = require('./src/models');
const bcrypt = require('bcryptjs');

const doctors = [
  {
    name: 'Dr. Sameer Mehta',
    phone: '9876543210',
    email: 'mehta@econsult.com',
    specialization: 'Cardiology',
    experience: 15,
    consultation_fee: 800,
    bio: 'Senior Cardiologist with over 15 years of experience in clinical excellence and patient care.',
  },
  {
    name: 'Dr. Anjali Sharma',
    phone: '9876543211',
    email: 'anjali@econsult.com',
    specialization: 'Pediatrics',
    experience: 8,
    consultation_fee: 500,
    bio: 'Dedicated Pediatrician focused on child development and preventative healthcare.',
  },
  {
    name: 'Dr. Vikram Singh',
    phone: '9876543212',
    email: 'vikram@econsult.com',
    specialization: 'Orthopedics',
    experience: 12,
    consultation_fee: 650,
    bio: 'Orthopedic Surgeon specializing in sports medicine and joint replacement.',
  },
];

(async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();
    console.log('Database ready for doctor seeding.');

    for (const doc of doctors) {
      const existing = await db.User.findOne({ where: { phone: doc.phone } });
      if (!existing) {
        const hashedPassword = await bcrypt.hash('password123', 12);
        const user = await db.User.create({
          name: doc.name,
          phone: doc.phone,
          email: doc.email,
          role: 'DOCTOR',
          password: hashedPassword,
        });

        await db.Doctor.create({
          user_id: user.id,
          specialization: doc.specialization,
          experience: doc.experience,
          consultation_fee: doc.consultation_fee,
          bio: doc.bio,
        });
        console.log(`Seeded: ${doc.name}`);
      } else {
        const doctor = await db.Doctor.findOne({ where: { user_id: existing.id } });
        if (doctor) {
          await doctor.update({
            consultation_fee: doc.consultation_fee,
            bio: doc.bio,
          });
          console.log(`Updated profile for: ${doc.name}`);
        }
      }
    }

    console.log('Doctor seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Doctor seeding failed:', error);
    process.exit(1);
  }
})();
