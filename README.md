# Zayd Hotel – Full-Stack Hotel Management System

A complete hotel management system built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JS.

## Features

- **User Roles** – Admin, Staff, and Customer with role-based access control
- **Room Management** – Add, edit, delete rooms with types, pricing, and features
- **Booking Management** – Create bookings, check-in/out, automatic price calculation
- **Customer Management** – View customer details and booking history
- **Staff Management** – Admin can add/remove staff members
- **Dashboard** – Stats overview with occupancy rate, revenue, and today's activity
- **Authentication** – JWT-based login with bcrypt password hashing

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Auth:** JWT (JSON Web Tokens)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Edit the `.env` file with your MongoDB connection string:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/zayd-hotel
JWT_SECRET=zayd_hotel_secret_key_2024
```

### 3. Seed the database

```bash
npm run seed
```

This creates sample data with the following login credentials:

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@zaydhotel.com    | admin123    |
| Staff    | staff@zaydhotel.com    | staff123    |
| Customer | alice@example.com      | customer123 |

### 4. Start the server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 5. Open in browser

Go to `http://localhost:5000`

## Project Structure

```
Zayd-Hotel/
├── server.js              # Express server entry point
├── models/                # Mongoose schemas
│   ├── User.js
│   ├── Room.js
│   ├── Booking.js
│   └── Service.js
├── controllers/           # Route handler logic
│   ├── authController.js
│   ├── roomController.js
│   ├── bookingController.js
│   ├── customerController.js
│   └── staffController.js
├── routes/                # API route definitions
│   ├── auth.js
│   ├── rooms.js
│   ├── bookings.js
│   ├── customers.js
│   └── staff.js
├── middleware/             # Auth and role middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── utils/                 # Helper functions
│   ├── calculatePrice.js
│   └── validateInput.js
├── public/                # Frontend files
│   ├── index.html         # Login/Register page
│   ├── dashboard.html     # Admin dashboard
│   ├── rooms.html         # Room management
│   ├── bookings.html      # Booking management
│   ├── customers.html     # Customer management
│   ├── staff.html         # Staff management
│   ├── css/style.css
│   └── js/main.js
└── scripts/
    └── seed.js            # Database seeder
```

## API Endpoints

### Auth
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Get current user

### Rooms
- `GET /api/rooms` – List all rooms (with filters)
- `POST /api/rooms` – Create room (admin)
- `PUT /api/rooms/:id` – Update room (admin)
- `DELETE /api/rooms/:id` – Delete room (admin)

### Bookings
- `GET /api/bookings` – List bookings
- `GET /api/bookings/stats` – Dashboard stats
- `POST /api/bookings` – Create booking (admin/staff)
- `PUT /api/bookings/:id` – Update booking status
- `DELETE /api/bookings/:id` – Delete booking (admin)

### Customers
- `GET /api/customers` – List customers (admin/staff)
- `GET /api/customers/:id` – Customer details + history
- `PUT /api/customers/:id` – Update customer
- `DELETE /api/customers/:id` – Delete customer (admin)

### Staff
- `GET /api/staff` – List staff (admin)
- `POST /api/staff` – Create staff (admin)
- `PUT /api/staff/:id` – Update staff (admin)
- `DELETE /api/staff/:id` – Delete staff (admin)
