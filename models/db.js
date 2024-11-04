const dotenv = require('dotenv');
const Sequelize = require('sequelize');
const winston = require('winston');
dotenv.config({ path: './config.env' });

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: 'localhost',
        dialect: 'mysql', // Change this to 'mysql'
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