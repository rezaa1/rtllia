const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Agent = require('./Agent');

const Call = sequelize.define('Call', {
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
    allowNull: false,
    references: {
      model: 'agents',
      key: 'id'
    }
  },
  retellCallId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  fromNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  toNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  direction: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER
  },
  startedAt: {
    type: DataTypes.DATE
  },
  endedAt: {
    type: DataTypes.DATE
  },
  callData: {
    type: DataTypes.JSONB
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
  tableName: 'calls',
  timestamps: true
});

// Define associations
Call.belongsTo(Organization, { foreignKey: 'organizationId' });
Call.belongsTo(Agent, { foreignKey: 'agentId' });

module.exports = Call;
