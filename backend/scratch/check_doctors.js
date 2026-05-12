const db = require('./src/models');

async function check() {
  try {
    const doctorCount = await db.Doctor.count();
    const doctors = await db.Doctor.findAll({ include: [db.User] });
    console.log('Doctor Count:', doctorCount);
    console.log('Doctors:', JSON.stringify(doctors, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
