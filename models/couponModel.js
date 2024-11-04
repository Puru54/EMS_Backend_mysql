const { DataTypes } = require('sequelize');
const db = require('./db');
const Event = require('./eventModel');
const Pricing = require('./priceModel');

// Define Coupon model
const Coupon = db.define('Coupon', {
    couponId: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'percentage',
    },
    eventID: {
        type: DataTypes.UUID,
        references: {
            model: Event,
            key: 'eventid',
        },
        allowNull: false,
    },
    pricingId: {
        type: DataTypes.BIGINT,
        references: {
            model: Pricing,
            key: 'pricingId',
        },
        allowNull: false,
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // Set a default usage limit
    },
    timesUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, // Start with zero usages
    }
});

// Sync database if 'Coupons' table doesn't exist or requires alteration
async function syncDb() {
    try {
        const tableExists = await db.getQueryInterface().showAllTables();

        if (!tableExists.map(table => table.toLowerCase()).includes('coupons')) {
            await db.sync({ alter: true });
            console.log('Coupons table created and synchronized');
        } else {
            console.log('Coupons table already exists. No sync needed.');
        }
    } catch (error) {
        console.error('Error during sync:', error);
    }
}

syncDb();

module.exports = Coupon;