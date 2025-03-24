const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const User = require('./User');

const Agent = sequelize.define('Agent', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  retellAgentId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  voiceId: {
    type: DataTypes.STRING(50),
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
  tableName: 'agents',
  timestamps: true
});

// Define associations
Agent.belongsTo(Organization, { foreignKey: 'organizationId' });
Agent.belongsTo(User, { foreignKey: 'userId' });

module.exports = Agent;
