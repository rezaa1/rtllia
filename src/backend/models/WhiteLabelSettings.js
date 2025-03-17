const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');

const WhiteLabelSettings = sequelize.define('WhiteLabelSettings', {
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
    },
    unique: true
  },
  companyName: {
    type: DataTypes.STRING(100)
  },
  supportEmail: {
    type: DataTypes.STRING(100)
  },
  supportPhone: {
    type: DataTypes.STRING(20)
  },
  privacyPolicyUrl: {
    type: DataTypes.STRING(255)
  },
  termsOfServiceUrl: {
    type: DataTypes.STRING(255)
  },
  faviconUrl: {
    type: DataTypes.STRING(255)
  },
  logoUrl: {
    type: DataTypes.STRING(255)
  },
  loginBackgroundUrl: {
    type: DataTypes.STRING(255)
  },
  customCss: {
    type: DataTypes.TEXT
  },
  customJs: {
    type: DataTypes.TEXT
  },
  enableCustomBranding: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
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
  tableName: 'white_label_settings',
  timestamps: true
});

// Define associations
WhiteLabelSettings.belongsTo(Organization, { foreignKey: 'organizationId' });

module.exports = WhiteLabelSettings;
