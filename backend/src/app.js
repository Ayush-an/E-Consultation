const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

const apiRoutes = require('./routes');
const logger = require('./utils/logger');

// Security and Mids
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;
    
    if (status >= 500) {
      logger.error(`${method} ${url} - ${status} (${duration}ms)`, '', 'CRITICAL');
    } else if (status >= 400) {
      logger.warn(`${method} ${url} - ${status} (${duration}ms)`, 'CLIENT_ERR');
    } else {
      logger.info(`${method} ${url} - ${status} (${duration}ms)`, 'HTTP');
    }
  });
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API running seamlessly.' });
});

// App Routes
app.use('/api', apiRoutes);

module.exports = app;
