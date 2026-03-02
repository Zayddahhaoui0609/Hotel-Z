const Room = require('../models/Room');
const { validateRequired } = require('../utils/validateInput');

// Get all rooms
async function getAllRooms(req, res) {
    try {
        const { type, status, minPrice, maxPrice } = req.query;
        let filter = {};

        if (type) filter.type = type;
        if (status) filter.status = status;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        const rooms = await Room.find(filter).sort({ number: 1 });
        res.json(rooms);
    } catch (err) {
        console.error('Get rooms error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get single room
async function getRoom(req, res) {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (err) {
        console.error('Get room error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Create a room
async function createRoom(req, res) {
    try {
        const { number, type, price, features, description } = req.body;

        const missing = validateRequired({ number, type, price });
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
        }

        // Check if room number already exists
        const existing = await Room.findOne({ number });
        if (existing) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        const room = new Room({
            number,
            type,
            price,
            features: features || [],
            description
        });

        await room.save();
        res.status(201).json({ message: 'Room created', room });
    } catch (err) {
        console.error('Create room error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update a room
async function updateRoom(req, res) {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const { number, type, price, features, status, description } = req.body;

        // If changing room number, check it doesnt already exist
        if (number && number !== room.number) {
            const existing = await Room.findOne({ number });
            if (existing) {
                return res.status(400).json({ message: 'Room number already taken' });
            }
        }

        if (number) room.number = number;
        if (type) room.type = type;
        if (price) room.price = price;
        if (features) room.features = features;
        if (status) room.status = status;
        if (description !== undefined) room.description = description;

        await room.save();
        res.json({ message: 'Room updated', room });
    } catch (err) {
        console.error('Update room error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Delete a room
async function deleteRoom(req, res) {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room deleted' });
    } catch (err) {
        console.error('Delete room error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getAllRooms, getRoom, createRoom, updateRoom, deleteRoom };
