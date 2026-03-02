// Calculate the total price for a booking
function calculatePrice(checkIn, checkOut, roomPrice, services = []) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    // Calculate number of nights
    const timeDiff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        return { error: 'Check-out date must be after check-in date' };
    }

    const roomTotal = nights * roomPrice;

    // Add up service prices
    let servicesTotal = 0;
    for (let i = 0; i < services.length; i++) {
        servicesTotal += services[i].price || 0;
    }

    const totalPrice = roomTotal + servicesTotal;

    return {
        nights,
        roomTotal,
        servicesTotal,
        totalPrice
    };
}

module.exports = calculatePrice;
