const express = require('express');
const couponController = require('../controllers/couponController');
const authController = require('../controllers/authController');
const router = express.Router();

// Protect all routes below
router.use(authController.protect);

router
    .route('/')
    .get(couponController.getAllCoupons) // Get all coupons
    .post(authController.restrictTo('admin', 'eventmanager'), couponController.createCoupon); // Create a new coupon (restricted)

router
    .route('/:id')
    .get(couponController.getCoupon) // Get a single coupon by ID
    .patch(authController.restrictTo('admin', 'eventmanager'), couponController.updateCoupon) // Update a coupon (restricted)
    .delete(authController.restrictTo('admin'), couponController.deleteCoupon); // Delete a coupon (restricted)

// Get all coupons for a specific event
router.get('/event/:eventID', couponController.getCouponsByEventID);

module.exports = router;
