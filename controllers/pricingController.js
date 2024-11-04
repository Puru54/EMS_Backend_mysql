const Pricing = require('../models/priceModel');
const AppError = require('../utils/appError');
const Event = require('../models/eventModel')

// Create a new pricing scheme
exports.createPricing = async (req, res, next) => {
    try {
        // Fetch the event to get available seats
        const event = await Event.findByPk(req.body.eventID);
        if (!event) {
            return next(new AppError('Event not found', 404));
        }
        
        // Get all existing pricing schemes for the event
        const pricings = await Pricing.findAll({ where: { eventID: req.body.eventID } });

        // Calculate the current total seats from all existing pricing schemes
        const currentTotalSeats = pricings.reduce((total, pricing) => total + pricing.count, 0);

        // Calculate proposed total seats if adding the new pricing scheme
        const proposedTotalSeats = currentTotalSeats + req.body.count;

        // Debugging information (optional)
        // console.log(`Event available seats: ${event.available_seats}`);
        // console.log(`Current total seats from pricing schemes: ${currentTotalSeats}`);
        // console.log(`Seats to be added: ${req.body.count}`);
        // console.log(`Proposed total seats after addition: ${proposedTotalSeats}`);

        // Check if adding the new pricing would exceed available seats
        if (proposedTotalSeats > event.available_seats) {
            // console.log('Error: Exceeds available seats. Pricing scheme creation blocked.');
            return next(new AppError('Total seats in pricing schemes exceed available seats for the event', 400));
        }

        // Create the pricing scheme if validation passes
        const pricing = await Pricing.create(req.body);
        res.status(201).json({ data: pricing, status: 'success' });
    } catch (err) {
        next(err); // Pass error to global error handling middleware
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

// Validate total seats against pricing schemes, including the new one
const validateTotalSeats = async (eventId, newPricingSeats) => {
    const event = await Event.findByPk(eventId);
    if (!event) {
        throw new AppError('Event not found', 404);
    }
    const pricings = await Pricing.findAll({ where: { eventID: eventId } });
    const totalPricingSeats = pricings.reduce((total, pricing) => total + pricing.seats, newPricingSeats); // Add new pricing seats
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