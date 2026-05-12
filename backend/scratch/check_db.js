const { User, Doctor } = require('../src/models');
const { sequelize } = require('../src/config/db');

async function check() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();
    console.log('Total Users:', users.length);
    users.forEach(u => console.log(`- ${u.name} (${u.email}) - ${u.phone} [${u.role}]`));
    
    const doctors = await Doctor.findAll({ include: [User] });
    console.log('\nTotal Doctors:', doctors.length);
    doctors.forEach(d => console.log(`- Dr. ${d.User ? d.User.name : 'Unknown'} - Spec: ${d.specialization}`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
