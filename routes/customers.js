const express = require('express');
const router = express.Router();
const { getAllCustomers, getCustomer, updateCustomer, deleteCustomer, upgradeRoom, getMyProfile } = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/customers/me - any logged in customer gets their own profile
router.get('/me', authMiddleware, getMyProfile);

// POST /api/customers/upgrade - customer upgrades their room
router.post('/upgrade', authMiddleware, roleMiddleware('customer'), upgradeRoom);

// GET /api/customers - admin and staff
router.get('/', authMiddleware, roleMiddleware('admin', 'staff'), getAllCustomers);

// GET /api/customers/:id
router.get('/:id', authMiddleware, roleMiddleware('admin', 'staff'), getCustomer);

// PUT /api/customers/:id
router.put('/:id', authMiddleware, roleMiddleware('admin', 'staff'), updateCustomer);

// DELETE /api/customers/:id - admin only
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteCustomer);

module.exports = router;
