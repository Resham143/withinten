const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Store = require('./store.model');
const Owner = require('./owner.model');

const StoreDetail = sequelize.define('StoreDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  store_id: {
    type: DataTypes.STRING(8),
    allowNull: false,
    references: {
      model: Store,
      key: 'store_id'
    }
  },
  store_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  owner_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Owner,
      key: 'owner_id'
    }
  },
  store_image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  landmark: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  opening_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  closing_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  is_open: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'tbl_store_detail',
  timestamps: true,
  underscored: true
});

// Define relationship
Store.hasOne(StoreDetail, { foreignKey: 'store_id' });
StoreDetail.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = StoreDetail; 