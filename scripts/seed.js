const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Room = require('../models/Room');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

function addDays(date, days) {
    var d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await User.deleteMany({});
        await Room.deleteMany({});
        await Service.deleteMany({});
        await Booking.deleteMany({});
        console.log('Cleared old data');

        var salt = await bcrypt.genSalt(10);
        var adminPassword = await bcrypt.hash('admin123', salt);
        var staffPassword = await bcrypt.hash('staff123', salt);
        var customerPassword = await bcrypt.hash('customer123', salt);

        var admin = await User.create({
            name: 'Zayd Dahhaoui',
            email: 'admin@zaydhotel.com',
            password: adminPassword,
            role: 'admin',
            phone: '+49 170 1234567'
        });
        console.log('Created admin user');

        var staff1 = await User.create({
            name: 'Anna Weber',
            email: 'anna@zaydhotel.com',
            password: staffPassword,
            role: 'staff',
            phone: '+49 170 2345678'
        });

        var staff2 = await User.create({
            name: 'Thomas Fischer',
            email: 'thomas@zaydhotel.com',
            password: staffPassword,
            role: 'staff',
            phone: '+49 170 3456789'
        });
        console.log('Created staff users');

        // Customers (with balance for upgrades)
        var customers = await User.insertMany([
            { name: 'Alice Johnson',     email: 'alice@example.com',   password: customerPassword, role: 'customer', phone: '+1 555 0101',           idNumber: 'P12345678', balance: 1500 },
            { name: 'Bob Smith',         email: 'bob@example.com',     password: customerPassword, role: 'customer', phone: '+1 555 0102',           idNumber: 'P87654321', balance: 2000 },
            { name: 'Maria Schmidt',     email: 'maria@example.com',   password: customerPassword, role: 'customer', phone: '+49 151 1234567',       idNumber: 'DE9876543', balance: 800  },
            { name: 'Hans Mueller',      email: 'hans@example.com',    password: customerPassword, role: 'customer', phone: '+49 152 2345678',       idNumber: 'DE1234567', balance: 500  },
            { name: 'Sophie Laurent',    email: 'sophie@example.com',  password: customerPassword, role: 'customer', phone: '+33 6 12345678',        idNumber: 'FR5551234', balance: 3000 },
            { name: 'Marco Rossi',       email: 'marco@example.com',   password: customerPassword, role: 'customer', phone: '+39 320 1234567',       idNumber: 'IT4321000', balance: 4500 },
            { name: 'Emma Wilson',       email: 'emma@example.com',    password: customerPassword, role: 'customer', phone: '+44 7700 123456',       idNumber: 'UK9998877', balance: 1200 },
            { name: 'Yuki Tanaka',       email: 'yuki@example.com',    password: customerPassword, role: 'customer', phone: '+81 90 1234 5678',      idNumber: 'JP1122334', balance: 5000 },
            { name: 'Carlos Garcia',     email: 'carlos@example.com',  password: customerPassword, role: 'customer', phone: '+34 612 345 678',       idNumber: 'ES5566778', balance: 750  },
            { name: 'Lena Braun',        email: 'lena@example.com',    password: customerPassword, role: 'customer', phone: '+49 163 4567890',       idNumber: 'DE7788990', balance: 2500 },
            { name: 'David Kim',         email: 'david@example.com',   password: customerPassword, role: 'customer', phone: '+82 10 1234 5678',      idNumber: 'KR1234000', balance: 1800 },
            { name: 'Fatima Al-Hassan',  email: 'fatima@example.com',  password: customerPassword, role: 'customer', phone: '+971 50 123 4567',      idNumber: 'AE9871234', balance: 3200 }
        ]);
        console.log('Created ' + customers.length + ' customers');

        // Rooms
        // r[0]=101 Available, r[1]=102 Available, r[2]=103 Available
        // r[3]=201 Occupied(alice), r[4]=202 Available(upgrade target)
        // r[5]=203 Occupied(maria), r[6]=301 Available(upgrade target)
        // r[7]=302 Maintenance, r[8]=401 Occupied(marco)
        // r[9]=402 Available, r[10]=104 Occupied(today-checkin), r[11]=205 Occupied(today-checkin2)
        var rooms = await Room.insertMany([
            { number: '101', type: 'Single',  price: 80,  features: ['Wi-Fi', 'TV', 'AC'],                              status: 'Available' },
            { number: '102', type: 'Single',  price: 80,  features: ['Wi-Fi', 'TV', 'AC'],                              status: 'Available' },
            { number: '103', type: 'Single',  price: 85,  features: ['Wi-Fi', 'AC'],                                    status: 'Available' },
            { number: '201', type: 'Double',  price: 120, features: ['Wi-Fi', 'TV', 'AC', 'Mini Bar'],                  status: 'Occupied'  },
            { number: '202', type: 'Double',  price: 120, features: ['Wi-Fi', 'TV', 'AC', 'Mini Bar'],                  status: 'Available' },
            { number: '203', type: 'Double',  price: 130, features: ['Wi-Fi', 'TV', 'AC', 'Balcony'],                   status: 'Occupied'  },
            { number: '301', type: 'Suite',   price: 250, features: ['Wi-Fi', 'TV', 'AC', 'Balcony', 'Mini Bar', 'Safe'], status: 'Available' },
            { number: '302', type: 'Suite',   price: 250, features: ['Wi-Fi', 'TV', 'AC', 'Balcony', 'Mini Bar'],       status: 'Maintenance'},
            { number: '401', type: 'Deluxe',  price: 400, features: ['Wi-Fi', 'TV', 'AC', 'Balcony', 'Mini Bar', 'Safe'], status: 'Occupied'  },
            { number: '402', type: 'Deluxe',  price: 420, features: ['Wi-Fi', 'TV', 'AC', 'Balcony', 'Mini Bar', 'Safe'], status: 'Available' },
            { number: '104', type: 'Single',  price: 80,  features: ['Wi-Fi', 'TV', 'AC'],                              status: 'Occupied'  },
            { number: '204', type: 'Double',  price: 125, features: ['Wi-Fi', 'TV', 'AC', 'Mini Bar'],                  status: 'Occupied'  }
        ]);
        console.log('Created ' + rooms.length + ' rooms');

        // Services
        var services = await Service.insertMany([
            { name: 'Frühstück', price: 15, description: 'Frühstücksbuffet' },
            { name: 'Spa-Zugang', price: 50, description: 'Ganztägiger Spa-Zugang' },
            { name: 'Wäscheservice', price: 20, description: 'Wäscheservice pro Tasche' },
            { name: 'Flughafentransfer', price: 35, description: 'Einfacher Flughafentransfer' },
            { name: 'Später Check-out', price: 30, description: 'Check-out bis 14 Uhr' }
        ]);
        console.log('Created ' + services.length + ' services');

        // Bookings with realistic dates
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var bookings = await Booking.insertMany([
            // Active bookings (currently checked in)
            { customer: customers[0]._id,  room: rooms[3]._id,  checkIn: addDays(today, -2),  checkOut: addDays(today, 3),  totalPrice: 600,  status: 'Checked-in',  paymentStatus: 'Paid'    },
            { customer: customers[2]._id,  room: rooms[5]._id,  checkIn: addDays(today, -1),  checkOut: addDays(today, 4),  totalPrice: 650,  status: 'Checked-in',  paymentStatus: 'Partial' },
            { customer: customers[5]._id,  room: rooms[8]._id,  checkIn: addDays(today, -3),  checkOut: addDays(today, 2),  totalPrice: 2000, status: 'Checked-in',  paymentStatus: 'Paid'    },

            // TODAY'S CHECK-INS (checkIn = today, status Confirmed so dashboard shows them)
            { customer: customers[6]._id,  room: rooms[10]._id, checkIn: today,               checkOut: addDays(today, 4),  totalPrice: 320,  status: 'Confirmed',   paymentStatus: 'Paid'    },
            { customer: customers[9]._id,  room: rooms[11]._id, checkIn: today,               checkOut: addDays(today, 5),  totalPrice: 625,  status: 'Confirmed',   paymentStatus: 'Unpaid'  },

            // TODAY'S CHECK-OUTS (checkOut = today, status Checked-in so dashboard shows them)
            { customer: customers[3]._id,  room: rooms[1]._id,  checkIn: addDays(today, -4),  checkOut: today,              totalPrice: 320,  status: 'Checked-in',  paymentStatus: 'Paid'    },
            { customer: customers[10]._id, room: rooms[0]._id,  checkIn: addDays(today, -3),  checkOut: today,              totalPrice: 240,  status: 'Checked-in',  paymentStatus: 'Paid'    },

            // Upcoming confirmed bookings
            { customer: customers[1]._id,  room: rooms[6]._id,  checkIn: addDays(today, 2),   checkOut: addDays(today, 6),  totalPrice: 1000, status: 'Confirmed',   paymentStatus: 'Unpaid'  },
            { customer: customers[4]._id,  room: rooms[2]._id,  checkIn: addDays(today, 5),   checkOut: addDays(today, 8),  totalPrice: 255,  status: 'Confirmed',   paymentStatus: 'Unpaid'  },
            { customer: customers[7]._id,  room: rooms[9]._id,  checkIn: addDays(today, 3),   checkOut: addDays(today, 10), totalPrice: 2940, status: 'Confirmed',   paymentStatus: 'Paid'    },
            { customer: customers[11]._id, room: rooms[4]._id,  checkIn: addDays(today, 7),   checkOut: addDays(today, 12), totalPrice: 600,  status: 'Confirmed',   paymentStatus: 'Unpaid'  },

            // Past bookings (checked out)
            { customer: customers[8]._id,  room: rooms[8]._id,  checkIn: addDays(today, -30), checkOut: addDays(today, -25),totalPrice: 2000, status: 'Checked-out', paymentStatus: 'Paid'    },
            { customer: customers[6]._id,  room: rooms[6]._id,  checkIn: addDays(today, -20), checkOut: addDays(today, -15),totalPrice: 1250, status: 'Checked-out', paymentStatus: 'Paid'    },
            { customer: customers[3]._id,  room: rooms[3]._id,  checkIn: addDays(today, -14), checkOut: addDays(today, -10),totalPrice: 480,  status: 'Checked-out', paymentStatus: 'Paid'    },

            // Cancelled booking
            { customer: customers[8]._id,  room: rooms[2]._id,  checkIn: addDays(today, 1),   checkOut: addDays(today, 4),  totalPrice: 255,  status: 'Cancelled',   paymentStatus: 'Unpaid'  }
        ]);
        console.log('Created ' + bookings.length + ' bookings');

        console.log('\n--- Seed Complete ---');
        console.log('Admin:    admin@zaydhotel.com / admin123');
        console.log('Staff:    anna@zaydhotel.com / staff123');
        console.log('Kunde:    alice@example.com / customer123');
        console.log('(Alle Kunden haben das Passwort: customer123)');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
}

seed();
