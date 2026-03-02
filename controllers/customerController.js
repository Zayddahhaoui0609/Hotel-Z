const User = require('../models/User');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Get all customers
async function getAllCustomers(req, res) {
    try {
        const customers = await User.find({ role: 'customer' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        console.error('Get customers error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get single customer with booking history
async function getCustomer(req, res) {
    try {
        const customer = await User.findById(req.params.id).select('-password');
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const bookings = await Booking.find({ customer: customer._id })
            .populate('room', 'number type price')
            .sort({ createdAt: -1 });

        res.json({ customer, bookings });
    } catch (err) {
        console.error('Get customer error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update customer
async function updateCustomer(req, res) {
    try {
        const { name, email, phone, idNumber } = req.body;

        const customer = await User.findById(req.params.id);
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (name) customer.name = name;
        if (email) customer.email = email;
        if (phone) customer.phone = phone;
        if (idNumber) customer.idNumber = idNumber;

        await customer.save();
        res.json({ message: 'Customer updated', customer: { ...customer.toObject(), password: undefined } });
    } catch (err) {
        console.error('Update customer error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Delete customer
async function deleteCustomer(req, res) {
    try {
        const customer = await User.findById(req.params.id);
        if (!customer || customer.role !== 'customer') {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        console.error('Delete customer error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Upgrade room - customer pays price difference from balance
async function upgradeRoom(req, res) {
    try {
        const { bookingId, newRoomId } = req.body;
        const customerId = req.user.id;

        const booking = await Booking.findById(bookingId).populate('room');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.customer.toString() !== customerId) return res.status(403).json({ message: 'Access denied' });
        if (booking.status === 'Checked-out' || booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Cannot upgrade a completed booking' });
        }

        const newRoom = await Room.findById(newRoomId);
        if (!newRoom) return res.status(404).json({ message: 'Room not found' });
        if (newRoom.status !== 'Available') return res.status(400).json({ message: 'Room not available' });
        if (newRoom._id.toString() === booking.room._id.toString()) {
            return res.status(400).json({ message: 'Already in this room' });
        }

        // Calculate nights
        const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));
        const oldTotal = booking.totalPrice;
        const newTotal = nights * newRoom.price;
        const priceDiff = newTotal - oldTotal;

        const customer = await User.findById(customerId);
        if (priceDiff > 0 && customer.balance < priceDiff) {
            return res.status(400).json({ message: 'Insufficient balance. You need $' + priceDiff + ' more.' });
        }

        // Free old room
        await Room.findByIdAndUpdate(booking.room._id, { status: 'Available' });
        // Occupy new room
        newRoom.status = 'Occupied';
        await newRoom.save();

        // Deduct balance (only positive difference)
        if (priceDiff > 0) {
            customer.balance = customer.balance - priceDiff;
            await customer.save();
        }

        booking.room = newRoomId;
        booking.totalPrice = newTotal;
        await booking.save();

        res.json({ message: 'Zimmer erfolgreich gewechselt', newBalance: customer.balance, newTotal });
    } catch (err) {
        console.error('Upgrade room error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get own profile (customer self)
async function getMyProfile(req, res) {
    try {
        const customer = await User.findById(req.user.id).select('-password');
        res.json(customer);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getAllCustomers, getCustomer, updateCustomer, deleteCustomer, upgradeRoom, getMyProfile };
