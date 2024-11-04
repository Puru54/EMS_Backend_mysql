const Pricing = require('../models/priceModel');
const AppError = require('../utils/appError');
const Event = require('../models/eventModel')

// Create a new pricing scheme
exports.createPricing = async (req, res) => {
    try {
        // Check total seats validation before creating
        await validateTotalSeats(req.body.eventID);

        // Check total pricing count before creating a new pricing scheme
        const totalPricingCount = await checkTotalPricingCount(req.body.eventID);
        
        const pricing = await Pricing.create(req.body);
        res.status(201).json({ data: pricing, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all pricing schemes
exports.getAllPricings = async (req, res) => {
    try {
        const pricings = await Pricing.findAll();
        res.status(200).json({ data: pricings, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
};

// Update a pricing scheme by ID
exports.updatePricing = async (req, res, next) => {
    try {
        const pricing = await Pricing.update(req.body, {
            where: { pricingId: req.params.id },
            returning: true,
        });

        if (pricing[0] === 0) {
            return next(new AppError('Pricing not found', 404));
        }

        res.status(200).json({ status: 'success', data: { pricing: pricing[1][0] } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a pricing scheme by ID
exports.deletePricing = async (req, res, next) => {
    try {
        const pricing = await Pricing.destroy({ where: { pricingId: req.params.id } });

        if (!pricing) {
            return next(new AppError('Pricing not found', 404));
        }

        res.status(200).json({ status: 'success', data: { status: 'Pricing deleted successfully' } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all pricing schemes for a specific event
exports.getPricingsByEventID = async (req, res) => {
    try {
        const pricings = await Pricing.findAll({ where: { eventID: req.params.eventID } });
        res.status(200).json({ data: pricings, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Validate total seats against pricing schemes
const validateTotalSeats = async (eventId) => {
    const event = await Event.findByPk(eventId);
    if (!event) {
        throw new AppError('Event not found', 404);
    }
    const pricings = await Pricing.findAll({ where: { eventID: eventId } });
    const totalPricingSeats = pricings.reduce((total, pricing) => total + pricing.seats, 0);
    if (totalPricingSeats > event.seats) {
        throw new AppError('Total seats in pricing schemes exceed available seats for the event', 400);
    }
};

// Check total counts of all pricing for an event before adding a new pricing scheme
const checkTotalPricingCount = async (eventId) => {
    const pricings = await Pricing.findAll({ where: { eventID: eventId } });
    const totalPricingCount = pricings.length; // Get the total count of existing pricing schemes
    return totalPricingCount; // Return the total count
};