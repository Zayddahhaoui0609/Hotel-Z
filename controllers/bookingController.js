const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Service = require('../models/Service');
const calculatePrice = require('../utils/calculatePrice');
const { validateRequired, validateDates } = require('../utils/validateInput');

// Get all bookings
async function getAllBookings(req, res) {
    try {
        let filter = {};

        // If customer, only show their bookings
        if (req.user.role === 'customer') {
            filter.customer = req.user.id;
        }

        const bookings = await Booking.find(filter)
            .populate('customer', 'name email phone')
            .populate('room', 'number type price')
            .populate('services', 'name price')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        console.error('Get bookings error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get single booking
async function getBooking(req, res) {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email phone idNumber')
            .populate('room', 'number type price features')
            .populate('services', 'name price');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Customers can only see their own bookings
        if (req.user.role === 'customer' && booking.customer._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(booking);
    } catch (err) {
        console.error('Get booking error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Create a booking
async function createBooking(req, res) {
    try {
        const { customer, room, checkIn, checkOut, services, notes } = req.body;

        const missing = validateRequired({ customer, room, checkIn, checkOut });
        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
        }

        // Validate dates
        const dateCheck = validateDates(checkIn, checkOut);
        if (!dateCheck.valid) {
            return res.status(400).json({ message: dateCheck.message });
        }

        // Check if room exists
        const roomDoc = await Room.findById(room);
        if (!roomDoc) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if room is available
        if (roomDoc.status !== 'Available') {
            return res.status(400).json({ message: 'Room is not available' });
        }

        // Check for overlapping bookings
        const overlap = await Booking.findOne({
            room: room,
            status: { $nin: ['Cancelled', 'Checked-out'] },
            $or: [
                { checkIn: { $lt: new Date(checkOut), $gte: new Date(checkIn) } },
                { checkOut: { $gt: new Date(checkIn), $lte: new Date(checkOut) } },
                { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gte: new Date(checkOut) } }
            ]
        });

        if (overlap) {
            return res.status(400).json({ message: 'Room is already booked for these dates' });
        }

        // Get services if any
        let serviceDocs = [];
        if (services && services.length > 0) {
            serviceDocs = await Service.find({ _id: { $in: services } });
        }

        // Calculate price
        const priceCalc = calculatePrice(checkIn, checkOut, roomDoc.price, serviceDocs);
        if (priceCalc.error) {
            return res.status(400).json({ message: priceCalc.error });
        }

        const booking = new Booking({
            customer,
            room,
            checkIn,
            checkOut,
            totalPrice: priceCalc.totalPrice,
            services: services || [],
            notes
        });

        await booking.save();

        // Update room status
        roomDoc.status = 'Occupied';
        await roomDoc.save();

        res.status(201).json({ message: 'Booking created', booking, priceDetails: priceCalc });
    } catch (err) {
        console.error('Create booking error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Update booking status
async function updateBooking(req, res) {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const { status, paymentStatus, notes } = req.body;

        if (status) {
            booking.status = status;

            // If checked out or cancelled, free up the room
            if (status === 'Checked-out' || status === 'Cancelled') {
                await Room.findByIdAndUpdate(booking.room, { status: 'Available' });
            }
        }

        if (paymentStatus) booking.paymentStatus = paymentStatus;
        if (notes !== undefined) booking.notes = notes;

        await booking.save();

        const updated = await Booking.findById(booking._id)
            .populate('customer', 'name email phone')
            .populate('room', 'number type price')
            .populate('services', 'name price');

        res.json({ message: 'Booking updated', booking: updated });
    } catch (err) {
        console.error('Update booking error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Delete booking
async function deleteBooking(req, res) {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Free the room if booking was active
        if (booking.status !== 'Checked-out' && booking.status !== 'Cancelled') {
            await Room.findByIdAndUpdate(booking.room, { status: 'Available' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking deleted' });
    } catch (err) {
        console.error('Delete booking error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

// Get dashboard stats
async function getStats(req, res) {
    try {
        const totalRooms = await Room.countDocuments();
        const availableRooms = await Room.countDocuments({ status: 'Available' });
        const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
        const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });

        const totalBookings = await Booking.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: { $in: ['Confirmed', 'Checked-in'] } });

        // Revenue from paid/partial bookings
        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: { $in: ['Paid', 'Partial'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Today's check-ins and check-outs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCheckIns = await Booking.find({
            checkIn: { $gte: today, $lt: tomorrow },
            status: 'Confirmed'
        }).populate('customer', 'name').populate('room', 'number type');

        const todayCheckOuts = await Booking.find({
            checkOut: { $gte: today, $lt: tomorrow },
            status: 'Checked-in'
        }).populate('customer', 'name').populate('room', 'number type');

        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        res.json({
            totalRooms,
            availableRooms,
            occupiedRooms,
            maintenanceRooms,
            totalBookings,
            activeBookings,
            totalRevenue,
            occupancyRate,
            todayCheckIns,
            todayCheckOuts
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getAllBookings, getBooking, createBooking, updateBooking, deleteBooking, getStats };
