const Ticket = require('../models/ticketModel');
const AppError = require('../utils/appError');

// Create a new ticket
exports.createTicket = async (req, res) => {
    try {
        const ticket = await Ticket.create(req.body);
        res.status(201).json({ data: ticket, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
