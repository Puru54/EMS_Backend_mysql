const express = require('express')
const eventController = require('./../controllers/eventController')
const authController = require('./../controllers/authController')
const router = express.Router()

router
    .route('/')
    .post(authController.protect , authController.restrictTo('eventmanager'),eventController.createEvent)
    .get(eventController.getAllEvents)
    .delete(authController.protect , authController.restrictTo('eventmanager'),eventController.deleteAllEvents)


router
    .route('/:id')
    .get(eventController.getEvent)
    .patch(authController.protect , authController.restrictTo('eventmanager'),eventController.updateEvent)
    .delete(authController.protect , authController.restrictTo('eventmanager'),eventController.deleteEvent);

router.put('/updateBanner' , eventController.uploadEventBanner, eventController.uploadEventImage)

router
    .route('/availability/:id')
    .get(eventController.getAvailableSeats)
    .patch(eventController.updateEventSeats)


router
    .route('/user/:id')
    .get(authController.protect , authController.restrictTo('eventmanager'),eventController.getAllEventsByCID)

router
    .route('/event/:id')
    .get(eventController.getEventStartDate)
// router.get('/:eventId/participants', eventController.getEventParticipants);

    
module.exports = router