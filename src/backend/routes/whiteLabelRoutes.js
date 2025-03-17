const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const whiteLabelController = require('../controllers/whiteLabelController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/white-label/:organizationId
// @desc    Get white label settings for an organization
// @access  Private/Organization Admin
router.get(
  '/:organizationId',
  authMiddleware.protect,
  authMiddleware.organizationAccess,
  whiteLabelController.getWhiteLabelSettings
);

// @route   PUT /api/white-label/:organizationId
// @desc    Update white label settings for an organization
// @access  Private/Organization Admin
router.put(
  '/:organizationId',
  authMiddleware.protect,
  authMiddleware.organizationAdmin,
  [
    body('companyName').optional().notEmpty().withMessage('Company name cannot be empty'),
    body('supportEmail').optional().isEmail().withMessage('Must be a valid email'),
    body('supportPhone').optional(),
    body('privacyPolicyUrl').optional().isURL().withMessage('Must be a valid URL'),
    body('termsOfServiceUrl').optional().isURL().withMessage('Must be a valid URL'),
    body('faviconUrl').optional().isURL().withMessage('Must be a valid URL'),
    body('logoUrl').optional().isURL().withMessage('Must be a valid URL'),
    body('loginBackgroundUrl').optional().isURL().withMessage('Must be a valid URL'),
    body('customCss').optional(),
    body('customJs').optional(),
    body('enableCustomBranding').optional().isBoolean()
  ],
  whiteLabelController.updateWhiteLabelSettings
);

// @route   POST /api/white-label/:organizationId/upload-logo
// @desc    Upload logo for an organization
// @access  Private/Organization Admin
router.post(
  '/:organizationId/upload-logo',
  authMiddleware.protect,
  authMiddleware.organizationAdmin,
  whiteLabelController.uploadLogo
);

// @route   POST /api/white-label/:organizationId/upload-favicon
// @desc    Upload favicon for an organization
// @access  Private/Organization Admin
router.post(
  '/:organizationId/upload-favicon',
  authMiddleware.protect,
  authMiddleware.organizationAdmin,
  whiteLabelController.uploadFavicon
);

// @route   POST /api/white-label/:organizationId/upload-background
// @desc    Upload login background for an organization
// @access  Private/Organization Admin
router.post(
  '/:organizationId/upload-background',
  authMiddleware.protect,
  authMiddleware.organizationAdmin,
  whiteLabelController.uploadBackground
);

// @route   GET /api/white-label/domain/:domain
// @desc    Get white label settings by domain
// @access  Public
router.get(
  '/domain/:domain',
  whiteLabelController.getWhiteLabelSettingsByDomain
);

module.exports = router;
