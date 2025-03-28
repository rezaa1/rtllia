const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationUsers,
  addUserToOrganization,
  checkSlugAvailability,
  getOrganizationByDomain,
  getWhiteLabelSettings,
  updateWhiteLabelSettings
} = require('../controllers/organizationController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/organizations
// @desc    Create a new organization
// @access  Public (for initial signup)
// router.post(
//   '/',
//   [
//     body('name').notEmpty().withMessage('Organization name is required'),
//     body('slug').notEmpty().withMessage('Organization slug is required')
//       .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
//     body('email').isEmail().withMessage('Valid email is required'),
//     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
//     body('username').notEmpty().withMessage('Username is required')
//   ],
//   createOrganization
// );

// @route   GET /api/organizations
// @desc    Get all organizations (admin only)
// @access  Private/Admin
// router.get('/', authMiddleware.protect, authMiddleware.admin, getAllOrganizations);

// @route   GET /api/organizations/:id
// @desc    Get organization by ID
// @access  Private/Admin or Organization Admin
// router.get('/:id', authMiddleware.protect, authMiddleware.organizationAccess, getOrganizationById);

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private/Organization Admin
router.put(
  '/:id',
  authMiddleware.protect,
  authMiddleware.organizationAdmin,
  [
    body('name').optional().notEmpty().withMessage('Organization name cannot be empty'),
    body('customDomain').optional().isURL().withMessage('Custom domain must be a valid URL')
  ],
  updateOrganization
);

// @route   DELETE /api/organizations/:id
// @desc    Delete organization
// @access  Private/Admin
router.delete('/:id', authMiddleware.protect, authMiddleware.admin, deleteOrganization);

// @route   GET /api/organizations/:id/users
// @desc    Get all users in an organization
// @access  Private/Organization Admin
router.get('/:id/users', authMiddleware.protect, authMiddleware.organizationAdmin, getOrganizationUsers);

// @route   POST /api/organizations/:id/users
// @desc    Add a user to an organization
// @access  Private/Organization Admin
router.post(
  '/:id/users',
  authMiddleware.protect,
  authMiddleware.organizationAdmin,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be either user or admin')
  ],
  addUserToOrganization
);

// @route   GET /api/organizations/check-slug/:slug
// @desc    Check if a slug is available
// @access  Public
router.get('/check-slug/:slug', checkSlugAvailability);

// @route   GET /api/organizations/domain/:domain
// @desc    Get organization by custom domain
// @access  Public
router.get('/domain/:domain', getOrganizationByDomain);

// @desc    Get organization white label settings
// @route   GET /api/organization/white-label
// @access  Private
router.get('/white-label', authMiddleware.protect, getWhiteLabelSettings);

// @desc    Update organization white label settings
// @route   PUT /api/organization/white-label
// @access  Private
router.put('/white-label', authMiddleware.protect, updateWhiteLabelSettings);

module.exports = router;