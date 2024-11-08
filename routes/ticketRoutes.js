const express = require('express');
const ticketController = require('../controllers/ticketController');
const authController = require('../controllers/authController');
const router = express.Router();

// Protect all routes below
router.use(authController.protect);

router
    .route('/')
    // .get(ticketController.getAllTickets) // Get all tickets
    .post(ticketController.createTicket); // Create a new ticket (restricted)

router
    .route('/:id')
    .get(ticketController.getTicket) // Get a single ticket by ID
    .patch(authController.restrictTo('admin', 'eventmanager'), ticketController.updateTicket) // Update a ticket (restricted)
    .delete(authController.restrictTo('admin'), ticketController.deleteTicket); // Delete a ticket (restricted)

// Get all tickets for a specific event
router.get('/event/:eventID', ticketController.getTicketsByEventID);

module.exports = router;