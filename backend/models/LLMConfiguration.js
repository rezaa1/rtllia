const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Agent = require('./Agent');

const LLMConfiguration = sequelize.define('LLMConfiguration', {
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
  retellLlmId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  s2sModel: {
    type: DataTypes.STRING(50)
  },
  temperature: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  highPriority: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  generalPrompt: {
    type: DataTypes.TEXT
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
  tableName: 'llm_configurations',
  timestamps: true
});

// Define associations
LLMConfiguration.belongsTo(Agent, { foreignKey: 'agentId' });

module.exports = LLMConfiguration;
