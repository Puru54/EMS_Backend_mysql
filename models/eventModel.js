const { DataTypes } = require('sequelize');
const db = require('./db');
const User = require('./userModel');

// Define Event model
const Event = db.define('Event', {
    eventid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // UUID generation in MySQL
        primaryKey: true,
    },
    eventmanagerCID: {
        type: DataTypes.STRING,
        references: {
            model: User,
            key: 'cid',
        },
    },
    eventName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eventType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eventLocation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eventDescription: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    max_purchase:{
        type: DataTypes.INTEGER,
    },
    available_seats: {
        type: DataTypes.INTEGER,
    },
    start_Date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_Date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    organizer: {
        type: DataTypes.STRING,
    },
    organizer_email: {
        type: DataTypes.STRING,
    },
    organizer_number: {
        type: DataTypes.STRING,
    },
    organizer_web: {
        type: DataTypes.STRING,
    },
    event_regulations: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('event_regulations');
            return rawValue ? rawValue.split(',') : [];
        },
        set(value) {
            this.setDataValue('event_regulations', value.join(','));
        },
    },
    media_Links: {
        type: DataTypes.TEXT,
        defaultValue: 'images/banners/custom-img.jpg'
    },
    tags: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('tags');
            return rawValue ? rawValue.split(',') : [];
        },
        set(value) {
            // Check if value is an array; if so, join it, otherwise, set as-is
            this.setDataValue('tags', Array.isArray(value) ? value.join(',') : value);
        },
    },
},{
        defaultScope: {
            attributes: { exclude: ['event_regulations', 'tags'] },
        },
        scopes: {
            withDetails: { attributes: {} },
            activeEvents: { where: { status: 'active' } },
            upcomingEvents: { where: { start_Date: { [db.Sequelize.Op.gte]: new Date() } } },
        },
        indexes: [
            { fields: ['eventName'] },
            { fields: ['eventType'] },
            { fields: ['start_Date'] },
            { fields: ['end_Date'] },
        ],
    });

// Establish relationship with User model
Event.belongsTo(User, {
    foreignKey: 'eventmanagerCID',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// Sync database if 'Events' table doesn't exist or requires alteration
async function syncDb() {
    try {
        const tableExists = await db.getQueryInterface().showAllTables();
        if (!tableExists.map(table => table.toLowerCase()).includes('events')) {
            await db.sync({ alter: true });
            console.log('Events table created and synchronized');
        } else {
            console.log('Events table already exists. No sync needed.');
        }
    } catch (error) {
        console.error('Error during sync:', error);
    }
}

syncDb();

module.exports = Event;