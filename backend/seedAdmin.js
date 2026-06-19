require('dotenv').config();
const db = require('./src/models');
const { ensureSuperAdmin } = require('./src/seed/superAdmin');

(async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();

    const result = await ensureSuperAdmin();

    if (result.created) {
      console.log('Super Admin created successfully');
    } else if (result.updated) {
      console.log('Super Admin updated successfully');
    } else {
      console.log('Super Admin already exists.');
    }

    console.log(`Email: ${result.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Admin seeding failed:', error);
    process.exit(1);
  }
})();
