const Pricing = require('../models/priceModel');
const AppError = require('../utils/appError');

// Create a new pricing scheme
exports.createPricing = async (req, res) => {
    try {
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
