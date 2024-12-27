const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Store = require('./store.model');

const StoreUser = sequelize.define('StoreUser', {
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
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  owner_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'tbl_store_user',
  timestamps: true,
  underscored: true
});

// Define relationship
Store.hasMany(StoreUser, { foreignKey: 'store_id' });
StoreUser.belongsTo(Store, { foreignKey: 'store_id' });

module.exports = StoreUser; 