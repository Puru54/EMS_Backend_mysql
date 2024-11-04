const Ticket = require('../models/ticketModel');
const Coupon = require('../models/couponModel');
const Event = require('../models/eventModel');
const AppError = require('../utils/appError');

// Helper function to check max purchase limit for tickets
const checkMaxPurchaseLimit = async (eventID, userID, requestedTickets) => {
    // Retrieve the event and its max_purchase limit
    const event = await Event.findByPk(eventID);

    if (!event) throw new AppError('Event not found', 404);

    // Check how many tickets the user has already purchased for this event
    const existingTickets = await Ticket.count({ where: { eventID, userID } });

    // Check if the total exceeds the max_purchase limit
    if (existingTickets + requestedTickets > event.max_purchase) {
        throw new AppError(
            `Cannot purchase more than ${event.max_purchase} tickets for this event.`,
            400
        );
    }
};

// Create a new ticket
exports.createTicket = async (req, res, next) => {
    try {
        const { couponCode, eventID, userID, ticketCount = 1 } = req.body;

        // Check if the coupon code is valid (if provided)
        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ where: { code: couponCode, eventID } });
            if (!coupon) {
                return next(new AppError('Invalid or expired coupon code', 400));
            }
        }

        // Check max purchase limit
        await checkMaxPurchaseLimit(eventID, userID, ticketCount);

        // Create the tickets based on ticketCount
        const tickets = await Promise.all(
            Array(ticketCount).fill().map(() => Ticket.create(req.body))
        );

        res.status(201).json({ data: tickets, status: 'success' });
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(err.message, 500));
    }
};

// Get all tickets
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll();
        res.status(200).json({ data: tickets, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single ticket by ID
exports.getTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findByPk(req.params.id);
        if (!ticket) {
            return next(new AppError('Ticket not found', 404));
        }
        res.status(200).json({ status: 'success', data: ticket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a ticket by ID
exports.updateTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.update(req.body, {
            where: { ticketID: req.params.id },
            returning: true,
        });

        if (ticket[0] === 0) {
            return next(new AppError('Ticket not found', 404));
        }

        res.status(200).json({ status: 'success', data: { ticket: ticket[1][0] } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a ticket by ID
exports.deleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.destroy({ where: { ticketID: req.params.id } });

        if (!ticket) {
            return next(new AppError('Ticket not found', 404));
        }

        res.status(200).json({ status: 'success', data: { status: 'Ticket deleted successfully' } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all tickets for a specific event
exports.getTicketsByEventID = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({ where: { eventID: req.params.eventID } });
        res.status(200).json({ data: tickets, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
