require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const setupSockets = require('./src/sockets/signaling');
const db = require('./src/models');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket Signaling
setupSockets(server);

// Test DB configure and sync models
db.sequelize
  .authenticate()
  .then(() => {
    logger.success('Database connected successfully', 'DB');
    // Enable this safely when models are bound
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    logger.info('Models synchronized with database', 'DB');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database', err, 'DB');
  });

server.listen(PORT, () => {
  logger.success(`Server listening on port ${PORT}`, 'READY');
});
