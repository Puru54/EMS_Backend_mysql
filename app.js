
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('./logger');
const cors = require('cors');

// Initialize express app
const app = express();

// Middleware configurations
app.use(express.static(path.join(__dirname, 'views')));
app.use(cors({
  origin: 'https://emsverify.wonstechnology.com'  
}));
app.use(cookieParser());
app.use(express.json());

// Routes
const userRouter = require('./routes/userRoutes');
const eventRouter = require('./routes/eventRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const couponRouter = require('./routes/couponRoutes');
const ticketRouter = require('./routes/ticketRoutes');
// const viewRouter = require('./routes/viewRoutes');

app.use('/api/v1/users', userRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/paymentschemes', paymentRouter);
app.use('/api/v1/coupons', couponRouter);
app.use('/api/v1/tickets', ticketRouter);
// app.use('/', viewRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err, err.message);
  res.status(500).send({ message: err.message, error: err });
});

module.exports = app;
