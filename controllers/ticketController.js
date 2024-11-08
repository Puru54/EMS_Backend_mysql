const Ticket = require('../models/ticketModel');
const Coupon = require('../models/couponModel');
const Event = require('../models/eventModel');
const AppError = require('../utils/appError');
const Pricing = require('../models/priceModel');

// Helper function to check max purchase limit for tickets
const checkMaxPurchaseLimit = async (eventID, userID, requestedTickets) => {
    const event = await Event.findByPk(eventID);
    if (!event) throw new AppError('Event not found', 404);

    // Check the user's existing ticket count for the event
    const existingTickets = await Ticket.count({ where: { eventID, userID } });
    if (existingTickets + requestedTickets > event.max_purchase) {
        throw new AppError(`Cannot purchase more than ${event.max_purchase} tickets for this event.`, 400);
    }
};

// Helper function to calculate final price after applying coupon
const applyCouponDiscount = async (couponCode, eventID, basePrice) => {
    // If no coupon code is provided, return the base price directly
    if (!couponCode) return basePrice;

    const coupon = await Coupon.findOne({ where: { code: couponCode, eventID } });
    if (!coupon) throw new AppError('Invalid or expired coupon code', 400);

    // Apply discount based on the coupon type
    let finalPrice = basePrice;
    if (coupon.type === 'percentage') {
        finalPrice -= (finalPrice * coupon.discount) / 100;
    } else if (coupon.type === 'fixed') {
        finalPrice -= coupon.discount;
    }

    // Ensure final price is not below zero
    finalPrice = Math.max(0, finalPrice);

    // Increment timesUsed for the coupon
    await coupon.increment('timesUsed');

    return finalPrice;
};

// Create a new ticket
exports.createTicket = async (req, res, next) => {
    try {
        const { couponCode, eventID, userID, ticketCount = 1, pricingScheme } = req.body;

        // Get price from Pricing model using pricingScheme ID
        const pricing = await Pricing.findByPk(pricingScheme);
        if (!pricing) {
            return next(new AppError('Pricing scheme not found', 400));
        }
        const basePrice = pricing.price;

        // Calculate final price after applying coupon discount (if applicable)
        const finalPrice = await applyCouponDiscount(couponCode, eventID, basePrice);

        // Check max purchase limit
        await checkMaxPurchaseLimit(eventID, userID, ticketCount);

        // Create tickets based on ticketCount
        const tickets = await Promise.all(
            Array.from({ length: ticketCount }, () =>
                Ticket.create({
                    ...req.body,
                    amount: finalPrice,
                    pricingScheme,
                })
            )
        );

        res.status(201).json({ status: 'success', data: tickets });
    } catch (err) {
        next(err instanceof AppError ? err : new AppError(err.message, 500));
    }
};

// Get all tickets
exports.getAllTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.findAll();
        res.status(200).json({ status: 'success', data: tickets });
    } catch (err) {
        next(err);
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
        next(err);
    }
};

// Update a ticket by ID
exports.updateTicket = async (req, res, next) => {
    try {
        const [updatedCount, updatedTickets] = await Ticket.update(req.body, {
            where: { ticketID: req.params.id },
            returning: true,
        });

        if (updatedCount === 0) {
            return next(new AppError('Ticket not found', 404));
        }

        res.status(200).json({ status: 'success', data: updatedTickets[0] });
    } catch (err) {
        next(err);
    }
};

// Delete a ticket by ID
exports.deleteTicket = async (req, res, next) => {
    try {
        const deletedCount = await Ticket.destroy({ where: { ticketID: req.params.id } });

        if (deletedCount === 0) {
            return next(new AppError('Ticket not found', 404));
        }

        res.status(200).json({ status: 'success', message: 'Ticket deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// Get all tickets for a specific event
exports.getTicketsByEventID = async (req, res, next) => {
    try {
        const tickets = await Ticket.findAll({ where: { eventID: req.params.eventID } });
        res.status(200).json({ status: 'success', data: tickets });
    } catch (err) {
        next(err);
    }
};