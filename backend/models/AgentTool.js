const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Agent = require('./Agent');

const AgentTool = sequelize.define('AgentTool', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agents',
      key: 'id'
    }
  },
  toolType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  toolConfig: {
    type: DataTypes.JSONB,
    allowNull: false
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
  tableName: 'agent_tools',
  timestamps: true
});

// Define associations
AgentTool.belongsTo(Agent, { foreignKey: 'agentId' });

module.exports = AgentTool;
