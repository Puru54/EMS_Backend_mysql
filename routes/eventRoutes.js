const express = require('express')
const eventController = require('./../controllers/eventController')
const router = express.Router()

router
    .route('/')
    .post(eventController.createEvent)
    .get(eventController.getAllEvents)
    .delete(eventController.deleteAllEvents)


router
    .route('/:id')
    .get(eventController.getEvent)
    .patch(eventController.updateEvent)
    .delete(eventController.deleteEvent);

router.put('/updateBanner',eventController.uploadEventBanner, eventController.uploadEventImage)

router
    .route('/availability/:id')
    .get(eventController.getAvailableSeats)
    .patch(eventController.updateEventSeats)


router
    .route('/user/:id')
    .get(eventController.getAllEventsByCID)

router
    .route('/event/:id')
    .get(eventController.getEventStartDate)
   
// router.get('/:eventId/participants', eventController.getEventParticipants);

    
module.exports = router