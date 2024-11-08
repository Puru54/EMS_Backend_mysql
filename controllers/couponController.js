const Coupon = require('../models/couponModel');
const AppError = require('../utils/appError');
const Pricing = require('../models/priceModel');

// Create a new coupon
exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ status: 'success', data: coupon });
    } catch (err) {
        next(err);
    }
};

// Get all coupons
exports.getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.findAll();
        res.status(200).json({ status: 'success', data: coupons });
    } catch (err) {
        next(err);
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
        next(err);
    }
};

// Update a coupon by ID
exports.updateCoupon = async (req, res, next) => {
    try {
        const [updatedCount, updatedCoupons] = await Coupon.update(req.body, {
            where: { couponId: req.params.id },
            returning: true,
        });

        if (updatedCount === 0) {
            return next(new AppError('Coupon not found', 404));
        }

        res.status(200).json({ status: 'success', data: updatedCoupons[0] });
    } catch (err) {
        next(err);
    }
};

// Delete a coupon by ID
exports.deleteCoupon = async (req, res, next) => {
    try {
        const deletedCount = await Coupon.destroy({ where: { couponId: req.params.id } });

        if (deletedCount === 0) {
            return next(new AppError('Coupon not found', 404));
        }

        res.status(200).json({ status: 'success', message: 'Coupon deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// Get all coupons for a specific event
exports.getCouponsByEventID = async (req, res, next) => {
    try {
        const coupons = await Coupon.findAll({ where: { eventID: req.params.eventID } });
        res.status(200).json({ status: 'success', data: coupons });
    } catch (err) {
        next(err);
    }
};

// Apply a coupon
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

        res.status(200).json({ status: 'success', message: 'Coupon applied successfully', data: coupon });
    } catch (err) {
        next(err);
    }
};

// Helper to validate coupon limit against the pricing model
const validateCouponLimit = async (pricingId, requestedCount) => {
    const pricing = await Pricing.findByPk(pricingId);
    if (!pricing) {
        throw new AppError('Pricing model not found', 404);
    }
    const existingCouponsCount = await Coupon.count({ where: { pricingId } });
    if (existingCouponsCount + requestedCount > pricing.count) {
        throw new AppError(`Cannot generate ${requestedCount} coupons. Exceeds limit of ${pricing.count} for this pricing model.`, 400);
    }
};

// Generate multiple coupons
exports.generateCoupons = async (req, res, next) => {
    try {
        const { count, pricingId, discount, type, eventID, usageLimit } = req.body;

        // Validate coupon limit
        await validateCouponLimit(pricingId, count);

        // Generate coupon data
        const couponsData = Array.from({ length: count }, () => ({
            code: `COUPON-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            discount: parseFloat(discount),
            type,
            eventID,
            pricingId,
            usageLimit,
            timesUsed: 0,
        }));

        // Bulk create the coupons
        const coupons = await Coupon.bulkCreate(couponsData);

        res.status(201).json({ status: 'success', message: `${count} coupons generated successfully`, data: coupons });
    } catch (err) {
        next(err);
    }
};