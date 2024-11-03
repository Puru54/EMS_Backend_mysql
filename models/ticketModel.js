const { DataTypes } = require('sequelize');
const db = require('./db');
const Event = require('./eventModel');
const Pricing = require('./priceModel');

// Define Ticket model
const Ticket = db.define('Ticket', {
    ticketID: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
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
    },
    ticket_validity: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    ticket_identifier: {
        type: DataTypes.STRING, // This can store a QR code link or a unique identifier
        allowNull: false,
    },
    cancel_validity: {
        type: DataTypes.DATE,
        allowNull: true, // Nullable if cancellation is not allowed
    },
    ticket_details: {
        type: DataTypes.JSON, // Stores additional details as key-value pairs
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
        const tableExists = await db.getQueryInterface().showAllTables();

        if (!tableExists.map(table => table.toLowerCase()).includes('tickets')) {
            await db.sync({ alter: true });
            console.log('Tickets table created and synchronized');
        } else {
            console.log('Tickets table already exists. No sync needed.');
        }
    } catch (error) {
        console.error('Error during sync:', error);
    }
}

syncDb();

module.exports = Ticket;
