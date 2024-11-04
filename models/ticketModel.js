const { DataTypes } = require('sequelize');
const db = require('./db');
const Event = require('./eventModel');
const User = require('./userModel');
const Pricing = require('./priceModel');
const Coupon = require('./couponModel'); // Import Coupon model

// Define Ticket model
const Ticket = db.define('Ticket', {
    ticketID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    userID: {
        type: DataTypes.BIGINT,
        references: {
            model: User,
            key: 'uid',
        },
        allowNull: false,
    },
    eventID: {
        type: DataTypes.UUID,
        references: {
            model: Event,
            key: 'eventid',
        },
        allowNull: false,
    },
    pricingScheme: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: 0, // Ensure the amount is non-negative
        },
    },
    ticket_validity: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Default to current date
    },
    ticket_identifier: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Enforce uniqueness
    },
    cancel_validity: {
        type: DataTypes.DATE,
        allowNull: true, // Nullable if cancellation is not allowed
    },
    couponCode: {
        type: DataTypes.STRING,
        references: {
            model: Coupon,
            key: 'code',
        },
        allowNull: true, // Coupon is optional
    },
    ticket_details: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        validate: {
            isValidDetails(value) {
                if (value && typeof value !== 'object') {
                    throw new Error('Ticket details must be a valid JSON object');
                }
            }
        }
    }
});

// Sync database if 'Tickets' table doesn't exist or requires alteration
async function syncDb() {
    try {
        await db.sync({ alter: true }); // Synchronize the table schema
        console.log('Tickets table synchronized');
    } catch (error) {
        console.error('Error during sync:', error);
    }
}

syncDb();

module.exports = Ticket;