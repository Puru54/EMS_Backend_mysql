const express = require('express');
const pricingController = require('../controllers/pricingController');
const authController = require('../controllers/authController');
const router = express.Router();

// Protect all routes below
router.use(authController.protect);

router
    .route('/')
    .get(pricingController.getAllPricings) // Get all pricing schemes
    .post(authController.restrictTo('admin', 'eventmanager'), pricingController.createPricing); // Create a new pricing scheme (restricted)

router
    .route('/:id')
    .get(pricingController.getPricing) // Get a single pricing scheme by ID
    .patch(authController.restrictTo('admin', 'eventmanager'), pricingController.updatePricing) // Update a pricing scheme (restricted)
    .delete(authController.restrictTo('admin'), pricingController.deletePricing); // Delete a pricing scheme (restricted)

// Get all pricing schemes for a specific event
router.get('/event/:eventID', pricingController.getPricingsByEventID);

module.exports = router;