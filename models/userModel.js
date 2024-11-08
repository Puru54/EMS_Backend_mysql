const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('./db');

// Define User model
const User = db.define('User', {
  uid: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  cid: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true, // Ensure 'cid' is unique but not the primary key
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phonenumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photo: {
    type: DataTypes.STRING,
    defaultValue: 'default.jpg',
  },
  role: {
    type: DataTypes.ENUM('user', 'eventmanager', 'admin'),
    defaultValue: 'user',
  },
  otp: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned'),
    defaultValue: 'active',
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, 255],
    },
  },
  // Virtual field for password confirmation
  passwordConfirm: {
    type: DataTypes.VIRTUAL,
    allowNull: false,
    validate: {
      matchPassword(value) {
        if (value !== this.password) {
          throw new Error('Passwords do not match');
        }
      }
    },
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      // Hash the password
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
  tableName: 'Users', // Explicit table name for case sensitivity
});

// Password comparison method
User.prototype.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Sync database if 'Users' table doesn't exist
async function syncDb() {
  try {
    const tableExists = await db.getQueryInterface().showAllTables();

    // Check if 'Users' table exists (case-insensitive for MySQL)
    if (!tableExists.map(table => table.toLowerCase()).includes('users')) {
      await db.sync({ alter: true });
      console.log('User table created and synchronized');
    } else {
      console.log('User table already exists. No sync needed.');
    }
  } catch (error) {
    console.error('Error during database synchronization:', error);
  }
}

syncDb();

module.exports = User;