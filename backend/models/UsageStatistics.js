const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');

const UsageStatistics = sequelize.define('UsageStatistics', {
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
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  agentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  callsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  callMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  usersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usage_statistics',
  timestamps: true,
  createdAt: false,
  indexes: [
    {
      unique: true,
      fields: ['organizationId', 'year', 'month']
    }
  ]
});

// Define associations
UsageStatistics.belongsTo(Organization, { foreignKey: 'organizationId' });

module.exports = UsageStatistics;
