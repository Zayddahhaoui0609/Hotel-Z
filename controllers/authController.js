const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateEmail, validateRequired } = require('../utils/validateInput');

// Register a new user
async function register(req, res) {
    try {
        const { name, email, password, role, phone, idNumber } = req.body;

        // Check required fields
        const missing = validateRequired({ name, email, password });
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer',
            phone,
            idNumber
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        const missing = validateRequired({ email, password });
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get current user info
async function getMe(req, res) {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { register, login, getMe };
