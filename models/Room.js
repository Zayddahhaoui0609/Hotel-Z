const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: { type: String, required: true, unique: true },
    type: { type: String, enum: ['Single', 'Double', 'Suite', 'Deluxe'], required: true },
    price: { type: Number, required: true },
    features: [String],
    status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
