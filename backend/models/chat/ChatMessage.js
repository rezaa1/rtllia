const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

class ChatMessage extends Model {}

ChatMessage.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chat_session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chat_sessions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  sender_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['user', 'agent', 'system']]
    }
  },
  message_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['text', 'voice', 'system']]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  voice_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'ChatMessage',
  tableName: 'chat_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = ChatMessage;
