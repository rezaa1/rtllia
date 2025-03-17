const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  customDomain: {
    type: DataTypes.STRING(255),
    unique: true
  },
  logoUrl: {
    type: DataTypes.STRING(255)
  },
  primaryColor: {
    type: DataTypes.STRING(20)
  },
  secondaryColor: {
    type: DataTypes.STRING(20)
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
  tableName: 'organizations',
  timestamps: true
});

module.exports = Organization;
