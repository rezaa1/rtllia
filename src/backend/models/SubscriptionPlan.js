const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  priceMonthly: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  priceYearly: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  maxAgents: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxCallsPerMonth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subscription_plans',
  timestamps: true
});

module.exports = SubscriptionPlan;
