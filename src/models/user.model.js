const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  profile_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profile_language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  store_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  store_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  store_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  store_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  store_opening_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  store_closing_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: true
  },
  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User; 