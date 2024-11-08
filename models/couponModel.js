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
        validate: {
            min: 0, // Ensures discount is non-negative
        },
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
        defaultValue: 1, 
        validate: {
            min: 1, // Ensures usageLimit is non-negative
        },
    },
    timesUsed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0, // Start with zero usages
    }
}, {
    scopes: {
        availableCoupons: { where: { usageLimit: { [db.Sequelize.Op.gt]: db.Sequelize.col('timesUsed') } } }, // Scope to get coupons that can still be used
    },
    indexes: [
        { fields: ['eventID'] },
        { fields: ['pricingId'] },
        { fields: ['code'] },
    ],
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