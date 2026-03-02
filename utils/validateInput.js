// Simple input validation helpers

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateRequired(fields) {
    const missing = [];
    for (const [key, value] of Object.entries(fields)) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            missing.push(key);
        }
    }
    return missing;
}

function validateDates(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { valid: false, message: 'Invalid date format' };
    }

    if (start < today) {
        return { valid: false, message: 'Check-in date cannot be in the past' };
    }

    if (end <= start) {
        return { valid: false, message: 'Check-out must be after check-in' };
    }

    return { valid: true };
}

module.exports = { validateEmail, validateRequired, validateDates };
