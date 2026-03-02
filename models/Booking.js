const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    status: {
        type: String,
        enum: ['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'],
        default: 'Confirmed'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Partial'],
        default: 'Unpaid'
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
