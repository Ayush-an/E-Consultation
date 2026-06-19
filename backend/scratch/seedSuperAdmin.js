require('dotenv').config();
const db = require('../src/models');
const { ensureSuperAdmin } = require('../src/seed/superAdmin');

(async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync();
    const result = await ensureSuperAdmin();
    console.log(result.created ? 'Created SUPERADMIN' : result.updated ? 'Updated SUPERADMIN' : 'Already exists');
    console.log(`Email: ${result.email}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
