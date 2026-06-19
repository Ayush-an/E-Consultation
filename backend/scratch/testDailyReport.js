require('dotenv').config();
const { sendDailyReports } = require('../src/services/notification.service');
const logger = require('../src/utils/logger');

const db = require('../src/models');

const runTest = async () => {
  try {
    logger.info('Syncing database...');
    await db.sequelize.sync({ alter: true });
    logger.success('Database synced.');

    logger.info('Starting manual execution of daily reports...');
    await sendDailyReports();
    logger.success('Manual daily report execution finished!');
    process.exit(0);
  } catch (error) {
    logger.error('Error executing manual daily reports', error);
    console.error('Full detailed error:', error);
    process.exit(1);
  }
};

runTest();
