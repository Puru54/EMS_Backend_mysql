const Coupon = require('../models/couponModel');
const AppError = require('../utils/appError');

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
