const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

class ChatSession extends Model {}

ChatSession.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agents',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  visitor_id: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ChatSession',
  tableName: 'chat_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ChatSession;
