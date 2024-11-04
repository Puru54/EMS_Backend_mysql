const Coupon = require('../models/couponModel');
const AppError = require('../utils/appError');
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


const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

exports.generateCoupons = async (req, res) => {
    try {
        const { count } = req.body;

        const couponsData = Array.from({ length: count }, () => ({
            code: `COUPON-${Math.random().toString(36).substr(2, 8).toUpperCase()}`, // Random code
            discount: parseFloat(req.body.discount), // Random discount between 5 and 50
            type: req.body.type, // Random type
            eventID: uuidv4(), // Random UUID for eventID
            pricingId: req.body.pricingId, // Random pricingId (assumes 1 to 100 as placeholder)
            usageLimit: req.body.usageLimit, // Random usage limit between 1 and 5
            timesUsed: 0, // Initialize with zero
        }));

        const coupons = await Coupon.bulkCreate(couponsData);

        res.status(201).json({ data: coupons, status: 'success', message: `${count} coupons generated successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};