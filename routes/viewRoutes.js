const express = require('express')
const router = express.Router()
const viewsController = require('./../controllers/viewController')

router.get('/', viewsController.getHome)
router.get('/signin', viewsController.getLoginForm)
router.get('/signup', viewsController.getSignupForm)
// router.get('/me',authController.protect,viewsController.getProfile)

/* Event routes start here */
router.get('/add_event', viewsController.getEventForm) 
router.get('/update_event', viewsController.getEventUpdatePage) 
router.get('/event_details',viewsController.getEventDetails)
router.get('/checkout',viewsController.getEventCheckout)
router.get('/bookingConfirmed',viewsController.getEventBooking)

/* Dashboard routes start here */ 
router.get('/organizer_events', viewsController.getOrganisedEvents)

/* Get Profile Information */ 
router.get('/event_profile',viewsController.getPaymentsmade)

/* Get 404 page */ 
router.use(viewsController.get404page);

module.exports = router