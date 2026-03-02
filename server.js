const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection (cached for serverless)
let isConnected = false;
async function connectDB() {
    if (isConnected && mongoose.connection.readyState === 1) return true;
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 8000,
            connectTimeoutMS: 8000
        });
        isConnected = true;
        console.log('Connected to MongoDB');
        return true;
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        return false;
    }
}

// Connect before API requests only (skip static files)
app.use('/api', async function(req, res, next) {
    const ok = await connectDB();
    if (!ok) return res.status(503).json({ message: 'Database unavailable. Please try again.' });
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/staff', require('./routes/staff'));

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server only when running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 5000;
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log('Server running on port ' + PORT);
        });
    });
}

// Export for Vercel serverless
module.exports = app;
