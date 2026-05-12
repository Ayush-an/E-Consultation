const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slot.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Doctor creates available slots
router.post('/', authMiddleware, slotController.createSlots);

// Patient gets available slots by doctor & date
router.get('/', slotController.getAvailableSlots);

// Patient books a specific slot constraint
router.put('/:id/book', authMiddleware, slotController.bookSlot);

module.exports = router;
