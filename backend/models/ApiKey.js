const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const User = require('./User');

const ApiKey = sequelize.define('ApiKey', {
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
  keyName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  apiKey: {
    type: DataTypes.STRING(100),
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
  lastUsedAt: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'api_keys',
  timestamps: true,
  updatedAt: false
});

// Define associations
ApiKey.belongsTo(Organization, { foreignKey: 'organizationId' });
ApiKey.belongsTo(User, { foreignKey: 'userId' });

module.exports = ApiKey;
