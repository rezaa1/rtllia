const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Agent = require('./Agent');

const PhoneNumber = sequelize.define('PhoneNumber', {
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
  agentId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'agents',
      key: 'id'
    }
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
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
  tableName: 'phone_numbers',
  timestamps: true
});

// Define associations
PhoneNumber.belongsTo(Organization, { foreignKey: 'organizationId' });
PhoneNumber.belongsTo(Agent, { foreignKey: 'agentId' });

module.exports = PhoneNumber;
