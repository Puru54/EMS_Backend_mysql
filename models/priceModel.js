const { DataTypes } = require('sequelize');
const db = require('./db');
const Event = require('./eventModel');

// Define Pricing model
const Pricing = db.define('Pricing', {
    pricingId: {
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
    pricingSchemeName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD',
    },
    description: {
        type: DataTypes.TEXT,
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    condition: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

// Establish relationship with Event model
Pricing.belongsTo(Event, {
    foreignKey: 'eventID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Sync database if 'Pricing' table doesn't exist or requires alteration
async function syncDb() {
    try {
        const tableExists = await db.getQueryInterface().showAllTables();

        if (!tableExists.map(table => table.toLowerCase()).includes('pricings')) {
            await db.sync({ alter: true });
            console.log('Pricing table created and synchronized');
        } else {
            console.log('Pricing table already exists. No sync needed.');
        }
    } catch (error) {
        console.error('Error during sync:', error);
    }
}

syncDb();

module.exports = Pricing;