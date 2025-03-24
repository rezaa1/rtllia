const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const SubscriptionPlan = require('./SubscriptionPlan');

const OrganizationSubscription = sequelize.define('OrganizationSubscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subscription_plans',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  currentPeriodStart: {
    type: DataTypes.DATE,
    allowNull: false
  },
  currentPeriodEnd: {
    type: DataTypes.DATE,
    allowNull: false
  },
  cancelAtPeriodEnd: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  paymentMethodId: {
    type: DataTypes.STRING(100)
  },
  subscriptionProviderId: {
    type: DataTypes.STRING(100)
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
  tableName: 'organization_subscriptions',
  timestamps: true
});

// Define associations
OrganizationSubscription.belongsTo(Organization, { foreignKey: 'organizationId' });
OrganizationSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'planId' });

module.exports = OrganizationSubscription;
