const Organization = require('../models/Organization');
const User = require('../models/User');
const WhiteLabelSettings = require('../models/WhiteLabelSettings');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

// @desc    Create a new organization with initial admin user
// @route   POST /api/organizations
// @access  Public
exports.createOrganization = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, slug, email, password, username, firstName, lastName } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Check if organization with slug already exists
    const existingOrg = await Organization.findOne({ 
      where: { slug },
      transaction
    });

    if (existingOrg) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Organization with this slug already exists' });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { transaction });

    // Create initial admin user
    const user = await User.create({
      organizationId: organization.id,
      username,
      email,
      passwordHash: password, // Will be hashed by model hook
      firstName: firstName || '',
      lastName: lastName || '',
      role: 'admin',
      isOrganizationAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { transaction });

    // Create default white label settings
    await WhiteLabelSettings.create({
      organizationId: organization.id,
      companyName: name,
      supportEmail: email,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { transaction });

    await transaction.commit();

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, organizationId: organization.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      },
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isOrganizationAdmin: user.isOrganizationAdmin
      },
      token
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all organizations (admin only)
// @route   GET /api/organizations
// @access  Private/Admin
exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      attributes: ['id', 'name', 'slug', 'customDomain', 'createdAt']
    });

    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get organization by ID
// @route   GET /api/organizations/:id
// @access  Private/Admin or Organization Admin
exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id, {
      include: [
        {
          model: WhiteLabelSettings,
          attributes: ['companyName', 'supportEmail', 'supportPhone', 'customDomain']
        }
      ]
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Organization Admin
exports.updateOrganization = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, customDomain, logoUrl, primaryColor, secondaryColor } = req.body;

  try {
    const organization = await Organization.findByPk(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update fields
    if (name) organization.name = name;
    if (customDomain !== undefined) organization.customDomain = customDomain;
    if (logoUrl) organization.logoUrl = logoUrl;
    if (primaryColor) organization.primaryColor = primaryColor;
    if (secondaryColor) organization.secondaryColor = secondaryColor;
    
    organization.updatedAt = new Date();

    await organization.save();

    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private/Admin
exports.deleteOrganization = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const organization = await Organization.findByPk(req.params.id, { transaction });

    if (!organization) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Organization not found' });
    }

    await organization.destroy({ transaction });
    await transaction.commit();

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users in an organization
// @route   GET /api/organizations/:id/users
// @access  Private/Organization Admin
exports.getOrganizationUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { organizationId: req.params.id },
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'isOrganizationAdmin', 'isActive', 'createdAt']
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching organization users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a user to an organization
// @route   POST /api/organizations/:id/users
// @access  Private/Organization Admin
exports.addUserToOrganization = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, firstName, lastName, role, isOrganizationAdmin } = req.body;

  try {
    // Check if organization exists
    const organization = await Organization.findByPk(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user with email already exists in this organization
    const existingUser = await User.findOne({
      where: {
        organizationId: req.params.id,
        email
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists in this organization' });
    }

    // Create user
    const user = await User.create({
      organizationId: req.params.id,
      username,
      email,
      passwordHash: password, // Will be hashed by model hook
      firstName: firstName || '',
      lastName: lastName || '',
      role: role || 'user',
      isOrganizationAdmin: isOrganizationAdmin || false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isOrganizationAdmin: user.isOrganizationAdmin
    });
  } catch (error) {
    console.error('Error adding user to organization:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if a slug is available
// @route   GET /api/organizations/check-slug/:slug
// @access  Public
exports.checkSlugAvailability = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const organization = await Organization.findOne({
      where: { slug }
    });

    res.json({ available: !organization });
  } catch (error) {
    console.error('Error checking slug availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get organization by custom domain
// @route   GET /api/organizations/domain/:domain
// @access  Public
exports.getOrganizationByDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    
    const organization = await Organization.findOne({
      where: { customDomain: domain },
      attributes: ['id', 'name', 'slug', 'customDomain', 'logoUrl', 'primaryColor', 'secondaryColor']
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization by domain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get white label settings
// @route   GET /api/organization/white-label
// @access  Private
const getWhiteLabelSettings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId; // Get organization ID from the user
    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Return the white label settings
    res.json({
      id: organization.id,
      name: organization.name,
      whiteLabelSettings: organization.whiteLabelSettings // Adjust based on your model
    });
  } catch (error) {
    console.error('Error getting white label settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getWhiteLabelSettings,
  // Other exports...
};
