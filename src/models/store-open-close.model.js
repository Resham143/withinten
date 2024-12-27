const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StoreOpenClose = sequelize.define('tbl_store_open_close', {
    store_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    open_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    closed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'tbl_store_open_close'
});

module.exports = StoreOpenClose; 