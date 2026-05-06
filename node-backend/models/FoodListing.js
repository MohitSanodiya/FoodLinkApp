const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const FoodListing = sequelize.define('FoodListing', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quantity: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pickup_time: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_by_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted'
  }
}, {
  tableName: 'food_listings',
  timestamps: false
});

// CRITICAL FIX: Relationship mapping
FoodListing.belongsTo(User, { foreignKey: 'created_by_id', as: 'creator' });
User.hasMany(FoodListing, { foreignKey: 'created_by_id', as: 'listings' });

module.exports = FoodListing;
