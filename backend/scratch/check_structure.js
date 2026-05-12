const { sequelize } = require('../src/models');

async function checkStructure() {
  try {
    const [results, metadata] = await sequelize.query("DESCRIBE Slots");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkStructure();
