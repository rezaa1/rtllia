const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const OrganizationSubscription = require('./OrganizationSubscription');

const BillingTransaction = sequelize.define('BillingTransaction', {
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
  subscriptionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'organization_subscriptions',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(50)
  },
  transactionId: {
    type: DataTypes.STRING(100)
  },
  invoiceUrl: {
    type: DataTypes.STRING(255)
  },
  description: {
    type: DataTypes.TEXT
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'billing_transactions',
  timestamps: true,
  updatedAt: false
});

// Define associations
BillingTransaction.belongsTo(Organization, { foreignKey: 'organizationId' });
BillingTransaction.belongsTo(OrganizationSubscription, { foreignKey: 'subscriptionId' });

module.exports = BillingTransaction;
