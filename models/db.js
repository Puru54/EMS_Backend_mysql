const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const winston = require('winston');
dotenv.config({ path: './config.env' });

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,      // Use DATABASE_HOST from config
        port: process.env.DATABASE_PORT,      // Use DATABASE_PORT from config
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    },
);

// Configure Sequelize to use winston for logging
// sequelize.options.logging = winston.debug;

module.exports = sequelize;