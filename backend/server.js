// server.js
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const setupSockets = require('./src/sockets/signaling');
const db = require('./src/models');
const logger = require('./src/utils/logger');
const { ensureSuperAdmin } = require('./src/seed/superAdmin');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

setupSockets(server);

const { initCronJobs } = require('./src/services/notification.service');
initCronJobs();

async function start() {
  try {
    await db.sequelize.authenticate();
    logger.success('Database connected successfully', 'DB');

    await db.sequelize.sync();
    logger.info('Models synchronized with database', 'DB');

    const seedResult = await ensureSuperAdmin();
    if (seedResult.created) {
      logger.success(`Super admin seeded: ${seedResult.email}`, 'SEED');
    } else if (seedResult.updated) {
      logger.success(`Super admin updated: ${seedResult.email}`, 'SEED');
    }

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Stop the other process and restart.`, err, 'READY');
      } else {
        logger.error('Server error', err, 'READY');
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      logger.success(`Server listening on port ${PORT}`, 'READY');
    });
  } catch (err) {
    logger.error('Failed to start server', err, 'FATAL');
    process.exit(1);
  }
}

start();
