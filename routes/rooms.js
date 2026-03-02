const express = require('express');
const router = express.Router();
const { getAllRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/rooms - anyone logged in can view rooms
router.get('/', authMiddleware, getAllRooms);

// GET /api/rooms/:id
router.get('/:id', authMiddleware, getRoom);

// POST /api/rooms - admin only
router.post('/', authMiddleware, roleMiddleware('admin'), createRoom);

// PUT /api/rooms/:id - admin only
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateRoom);

// DELETE /api/rooms/:id - admin only
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteRoom);

module.exports = router;
