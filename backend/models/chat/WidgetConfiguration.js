const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

class WidgetConfiguration extends Model {}

WidgetConfiguration.init({
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
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
  theme_color: {
    type: DataTypes.STRING(20),
    defaultValue: '#0088FF'
  },
  header_text: {
    type: DataTypes.STRING(100),
    defaultValue: 'Chat with us'
  },
  welcome_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  allowed_domains: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  }
}, {
  sequelize,
  modelName: 'WidgetConfiguration',
  tableName: 'widget_configurations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = WidgetConfiguration;
