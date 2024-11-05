const Coupon = require('../models/couponModel');
const AppError = require('../utils/appError');
const Pricing = require('../models/priceModel')
const { v4: uuidv4 } = require('uuid'); // For generating random event IDs

// Create a new coupon
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ data: coupon, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll();
        res.status(200).json({ data: coupons, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single coupon by ID
exports.getCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByPk(req.params.id);
        if (!coupon) {
            return next(new AppError('Coupon not found', 404));
        }
        res.status(200).json({ status: 'success', data: coupon });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a coupon by ID
exports.updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.update(req.body, {
            where: { couponId: req.params.id },
            returning: true,
        });

        if (coupon[0] === 0) {
            return next(new AppError('Coupon not found', 404));
        }

        res.status(200).json({ status: 'success', data: { coupon: coupon[1][0] } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a coupon by ID
exports.deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.destroy({ where: { couponId: req.params.id } });

        if (!coupon) {
            return next(new AppError('Coupon not found', 404));
        }

        res.status(200).json({ status: 'success', data: { status: 'Coupon deleted successfully' } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all coupons for a specific event
exports.getCouponsByEventID = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({ where: { eventID: req.params.eventID } });
        res.status(200).json({ data: coupons, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.applyCoupon = async (req, res, next) => {
    try {
        const { couponId } = req.params;

        // Fetch the coupon
        const coupon = await Coupon.findByPk(couponId);

        if (!coupon) {
            return next(new AppError('Coupon not found', 404));
        }

        // Check if coupon usage limit is reached
        if (coupon.timesUsed >= coupon.usageLimit) {
            return next(new AppError('Coupon usage limit reached', 400));
        }

        // Increment the timesUsed field by 1
        await coupon.increment('timesUsed');

        // Proceed with applying the coupon (e.g., applying discount logic here)
        res.status(200).json({ status: 'success', message: 'Coupon applied successfully', data: coupon });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Generate multiple coupons
exports.generateCoupons = async (req, res, next) => {
    try {
        const { count, pricingId } = req.body;

        // Fetch the pricing model and validate available coupon count
        const pricing = await Pricing.findByPk(pricingId);
        if (!pricing) {
            return next(new AppError('Pricing model not found', 404));
        }

        // Get the current count of coupons for this pricing model
        const existingCouponsCount = await Coupon.count({ where: { pricingId } });

        // Check if generating more coupons would exceed the pricing count limit
        if (existingCouponsCount + count > pricing.count) {
            return next(new AppError(`Cannot generate ${count} coupons. It would exceed the limit of ${pricing.count} for this pricing model.`, 400));
        }

        // Generate coupon data
        const couponsData = Array.from({ length: count }, () => ({
            code: `COUPON-${Math.random().toString(36).substr(2, 8).toUpperCase()}`, // Random code
            discount: parseFloat(req.body.discount), // Discount passed from the request
            type: req.body.type, // Type passed from the request
            eventID: req.body.eventID, // Random UUID for eventID
            pricingId, // Associate with the provided pricingId
            usageLimit: req.body.usageLimit, // Usage limit passed from the request
            timesUsed: 0, // Initialize with zero
        }));

        // Bulk create the coupons
        const coupons = await Coupon.bulkCreate(couponsData);

        res.status(201).json({ data: coupons, status: 'success', message: `${count} coupons generated successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};