const express = require('express');
const router = express.Router();
const { getAllBookings, getBooking, createBooking, updateBooking, deleteBooking, getStats } = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/bookings/stats - admin and staff
router.get('/stats', authMiddleware, roleMiddleware('admin', 'staff'), getStats);

// GET /api/bookings - admin/staff see all, customer sees own
router.get('/', authMiddleware, getAllBookings);

// GET /api/bookings/:id
router.get('/:id', authMiddleware, getBooking);

// POST /api/bookings - admin and staff can create
router.post('/', authMiddleware, roleMiddleware('admin', 'staff'), createBooking);

// PUT /api/bookings/:id - admin and staff can update
router.put('/:id', authMiddleware, roleMiddleware('admin', 'staff'), updateBooking);

// DELETE /api/bookings/:id - admin only
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteBooking);

module.exports = router;
