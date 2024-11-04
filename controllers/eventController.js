const Event = require('../models/eventModel');
const { Op } = require('sequelize'); // Import Sequelize operators
const AppError = require('../utils/appError');
const multer = require('multer');
// const Payment = require('../models/paymentModel');
// const User = require('../models/userModel');

// Multer storage configuration
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Multer destination called");
        cb(null, 'views/images/banners/user_uploads'); // Update the folder for event images
    },
    filename: (req, file, cb) => {
        const eventid = req.body.eventid;
        const ext = file.mimetype.split('/')[1];
        console.log('Event ID in filename:', eventid); // Log to confirm
        cb(null, `event-${eventid}-${Date.now()}.${ext}`);
    }
});

// Multer file filter for image validation
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images', 400), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// Middleware to upload a single image (photo field)
exports.uploadEventBanner = upload.single('photo');

// Function to handle image upload and return image URL
exports.uploadEventImage = async (req, res, next) => {
    try {

        console.log('File:', req.file);
        console.log('Event ID:', req.body.eventid);
        const imageUrl = 'images/banners/user_uploads/' + req.file.filename;
        const event = await Event.findByPk(req.body.eventid);
        event.media_Links = imageUrl;
        await event.save();

        res.json({ data: event, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all events directly from the database
exports.getAllEvents = async (req, res, next) => {
    try {
        const events = await Event.findAll();
        res.status(200).json({ data: events, status: 'success' });
    } catch (err) {
        res.status(500).json({ message: 'Database Query Failed', error: err.message });
    }
};

// Get all events by CID
exports.getAllEventsByCID = async (req, res, next) => {
    try {
        const events = await Event.findAll({ where: { eventmanagerCID: req.params.id } });
        res.status(200).json({ data: events, status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);
        res.json({ data: event, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single event by ID
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) {
            return next(new AppError('Event not found', 404));
        }
        res.status(200).json({ status: 'success', data: event });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update an event by ID
exports.updateEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const event = await Event.update(req.body, {
            where: { eventid: eventId },
            returning: true
        });

        if (event[0] === 0) {
            return next(new AppError('Event not found', 404));
        }

        res.status(200).json({
            status: 'success',
            data: { event: event[1][0] }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete an event by ID
exports.deleteEvent = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const event = await Event.destroy({ where: { eventid: eventId } });

        if (!event) {
            return next(new AppError('Event not found', 404));
        }

        res.status(200).json({ status: 'success', data: { status: "success" } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get available seats for an event
exports.getAvailableSeats = async (req, res, next) => {
    try {
        const event = await Event.findByPk(req.params.id);
        res.json({ data: event.available_seats, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update available seats for an event
exports.updateEventSeats = async (req, res, next) => {
    try {
        const event = await Event.findByPk(req.params.id);
        event.available_seats = req.body.available_seats;
        await event.save();
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get necessary details for an event
exports.getNeccessaryDetails = async (eventid) => {
    try {
        const event = await Event.findByPk(eventid);
        return {
            "eventid": event.eventid,
            "eventName": event.eventName,
            "media_Links": event.media_Links,
            "start_Date": event.start_Date
        };
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get the start date for an event
exports.getEventStartDate = async (req, res, next) => {
    try {
        const event = await Event.findByPk(req.params.id);
        res.json({ data: event.start_Date, status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get participants for an event
// exports.getEventParticipants = async (req, res, next) => {
//     try {
//         const eventId = req.params.eventId;
//         const payments = await Payment.findAll({ where: { event_ID: eventId } });

//         if (!payments || payments.length === 0) {
//             return next(new AppError('No participants found for this event', 404));
//         }

//         const participants = await Promise.all(
//             payments.map(async (payment) => {
//                 const user = await User.findByPk(payment.attendee_CID);
//                 return {
//                     cid: user.cid,
//                     name: user.name,
//                     email: user.email,
//                     phonenumber: user.phonenumber,
//                     pay_status: payment.pay_status,
//                 };
//             })
//         );

//         res.status(200).json({ status: 'success', data: participants });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// Delete all events
exports.deleteAllEvents = async (req, res, next) => {
    try {
        const result = await Event.destroy({
            where: {},
            truncate: true
        });

        if (!result) {
            return next(new AppError('No events found to delete', 404));
        }

        res.status(200).json({ status: 'success', data: { status: "All events deleted successfully" } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update tags for an event
exports.updateEventTags = async (req, res, next) => {
    try {
        const eventId = req.params.id;
        const { tags } = req.body; // Assume tags are passed as an array in the request body

        const event = await Event.findByPk(eventId);
        if (!event) {
            return next(new AppError('Event not found', 404));
        }

        event.tags = tags.join(','); // Convert array to comma-separated string
        await event.save();

        res.status(200).json({
            status: 'success',
            data: { event }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEventsByTags = async (req, res, next) => {
    try {
        const tag = req.params.tag; // Assume the tag is passed as a URL parameter
        const events = await Event.findAll({
            where: {
                tags: {
                    [Op.like]: `%${tag}%` // Partial match on tags
                }
            }
        });

        if (!events || events.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No events found with this tag'
            });
        }

        res.status(200).json({ status: 'success', data: events });
    } catch (err) {
        next(new AppError(err.message, 500)); // Forward the error to the error handler
    }
};

// ... (remaining functions)
