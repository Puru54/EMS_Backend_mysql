const Pricing = require('../models/priceModel');
const AppError = require('../utils/appError');
const Event = require('../models/eventModel');

// Fetch event and validate available seats
const fetchEventAndValidateSeats = async (eventID, newCount = 0) => {
    const event = await Event.findByPk(eventID);
    if (!event) {
        throw new AppError('Event not found', 404);
    }
    const totalSeats = await Pricing.sum('count', { where: { eventID } });
    if (totalSeats + newCount > event.available_seats) {
        throw new AppError('Total seats in pricing schemes exceed available seats for the event', 400);
    }
    return event;
};

// Create a new pricing scheme
exports.createPricing = async (req, res, next) => {
    try {
        // Fetch event and validate available seats with the new pricing count
        await fetchEventAndValidateSeats(req.body.eventID, req.body.count);

        // Create the pricing scheme
        const pricing = await Pricing.create(req.body);
        res.status(201).json({ status: 'success', data: pricing });
    } catch (err) {
        next(err); // Pass error to global error handling middleware
    }
};

// Get all pricing schemes
exports.getAllPricings = async (req, res, next) => {
    try {
        const pricings = await Pricing.findAll();
        res.status(200).json({ status: 'success', data: pricings });
    } catch (err) {
        next(err);
    }
};

// Get a single pricing scheme by ID
exports.getPricing = async (req, res, next) => {
    try {
        const pricing = await Pricing.findByPk(req.params.id);
        if (!pricing) {
            return next(new AppError('Pricing not found', 404));
        }
        res.status(200).json({ status: 'success', data: pricing });
    } catch (err) {
        next(err);
    }
};

// Update a pricing scheme by ID
exports.updatePricing = async (req, res, next) => {
    try {
        // Validate seat availability before updating
        if (req.body.count) {
            await fetchEventAndValidateSeats(req.body.eventID, req.body.count);
        }

        // Update pricing scheme
        const [updatedCount, updatedPricings] = await Pricing.update(req.body, {
            where: { pricingId: req.params.id },
            returning: true,
        });

        if (updatedCount === 0) {
            return next(new AppError('Pricing not found', 404));
        }

        res.status(200).json({ status: 'success', data: updatedPricings[0] });
    } catch (err) {
        next(err);
    }
};

// Delete a pricing scheme by ID
exports.deletePricing = async (req, res, next) => {
    try {
        const deletedCount = await Pricing.destroy({ where: { pricingId: req.params.id } });

        if (deletedCount === 0) {
            return next(new AppError('Pricing not found', 404));
        }

        res.status(200).json({ status: 'success', message: 'Pricing deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// Get all pricing schemes for a specific event
exports.getPricingsByEventID = async (req, res, next) => {
    try {
        const pricings = await Pricing.findAll({ where: { eventID: req.params.eventID } });
        res.status(200).json({ status: 'success', data: pricings });
    } catch (err) {
        next(err);
    }
};

// Validate total seats against pricing schemes
const validateTotalSeats = async (eventID, newPricingSeats = 0) => {
    const event = await Event.findByPk(eventID);
    if (!event) {
        throw new AppError('Event not found', 404);
    }
    const totalPricingSeats = await Pricing.sum('count', { where: { eventID } }) + newPricingSeats;
    if (totalPricingSeats > event.available_seats) {
        throw new AppError('Total seats in pricing schemes exceed available seats for the event', 400);
    }
};

// Check total counts of all pricing for an event before adding a new pricing scheme
const checkTotalPricingCount = async (eventID) => {
    return await Pricing.count({ where: { eventID } });
};
