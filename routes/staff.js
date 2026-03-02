const express = require('express');
const router = express.Router();
const { getAllStaff, getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All staff routes are admin-only
router.get('/', authMiddleware, roleMiddleware('admin'), getAllStaff);
router.get('/:id', authMiddleware, roleMiddleware('admin'), getStaff);
router.post('/', authMiddleware, roleMiddleware('admin'), createStaff);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateStaff);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteStaff);

module.exports = router;
