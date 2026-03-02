const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Get all staff members
async function getAllStaff(req, res) {
    try {
        const staff = await User.find({ role: 'staff' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(staff);
    } catch (err) {
        console.error('Get staff error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get single staff member
async function getStaff(req, res) {
    try {
        const staff = await User.findById(req.params.id).select('-password');
        if (!staff || staff.role !== 'staff') {
            return res.status(404).json({ message: 'Staff member not found' });
        }
        res.json(staff);
    } catch (err) {
        console.error('Get staff error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Create a staff member
async function createStaff(req, res) {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const staff = new User({
            name,
            email,
            password: hashedPassword,
            role: 'staff',
            phone
        });

        await staff.save();
        res.status(201).json({ message: 'Staff member created', staff: { ...staff.toObject(), password: undefined } });
    } catch (err) {
        console.error('Create staff error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update staff member
async function updateStaff(req, res) {
    try {
        const { name, email, phone, password } = req.body;

        const staff = await User.findById(req.params.id);
        if (!staff || staff.role !== 'staff') {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        if (name) staff.name = name;
        if (email) staff.email = email;
        if (phone) staff.phone = phone;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            staff.password = await bcrypt.hash(password, salt);
        }

        await staff.save();
        res.json({ message: 'Staff updated', staff: { ...staff.toObject(), password: undefined } });
    } catch (err) {
        console.error('Update staff error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Delete staff member
async function deleteStaff(req, res) {
    try {
        const staff = await User.findById(req.params.id);
        if (!staff || staff.role !== 'staff') {
            return res.status(404).json({ message: 'Staff member not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Staff member deleted' });
    } catch (err) {
        console.error('Delete staff error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getAllStaff, getStaff, createStaff, updateStaff, deleteStaff };
