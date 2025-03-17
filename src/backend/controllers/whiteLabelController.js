const WhiteLabelSettings = require('../models/WhiteLabelSettings');
const Organization = require('../models/Organization');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads', req.params.organizationId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter for uploads
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter
});

// @desc    Get white label settings for an organization
// @route   GET /api/white-label/:organizationId
// @access  Private/Organization Admin
exports.getWhiteLabelSettings = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    // Check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Get white label settings
    let settings = await WhiteLabelSettings.findOne({
      where: { organizationId }
    });
    
    // If settings don't exist, create default settings
    if (!settings) {
      settings = await WhiteLabelSettings.create({
        organizationId,
        companyName: organization.name,
        supportEmail: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching white label settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update white label settings for an organization
// @route   PUT /api/white-label/:organizationId
// @access  Private/Organization Admin
exports.updateWhiteLabelSettings = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { organizationId } = req.params;
    
    // Check if organization exists
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Get white label settings
    let settings = await WhiteLabelSettings.findOne({
      where: { organizationId }
    });
    
    // If settings don't exist, create them
    if (!settings) {
      settings = await WhiteLabelSettings.create({
        organizationId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update settings
      await settings.update({
        ...req.body,
        updatedAt: new Date()
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating white label settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload logo for an organization
// @route   POST /api/white-label/:organizationId/upload-logo
// @access  Private/Organization Admin
exports.uploadLogo = async (req, res) => {
  const uploadSingle = upload.single('logo');
  
  uploadSingle(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      const { organizationId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get white label settings
      let settings = await WhiteLabelSettings.findOne({
        where: { organizationId }
      });
      
      // Generate URL for the uploaded file
      const fileUrl = `/uploads/${organizationId}/${req.file.filename}`;
      
      // If settings don't exist, create them
      if (!settings) {
        settings = await WhiteLabelSettings.create({
          organizationId,
          logoUrl: fileUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update logo URL
        await settings.update({
          logoUrl: fileUrl,
          updatedAt: new Date()
        });
      }
      
      res.json({
        message: 'Logo uploaded successfully',
        logoUrl: fileUrl
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// @desc    Upload favicon for an organization
// @route   POST /api/white-label/:organizationId/upload-favicon
// @access  Private/Organization Admin
exports.uploadFavicon = async (req, res) => {
  const uploadSingle = upload.single('favicon');
  
  uploadSingle(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      const { organizationId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get white label settings
      let settings = await WhiteLabelSettings.findOne({
        where: { organizationId }
      });
      
      // Generate URL for the uploaded file
      const fileUrl = `/uploads/${organizationId}/${req.file.filename}`;
      
      // If settings don't exist, create them
      if (!settings) {
        settings = await WhiteLabelSettings.create({
          organizationId,
          faviconUrl: fileUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update favicon URL
        await settings.update({
          faviconUrl: fileUrl,
          updatedAt: new Date()
        });
      }
      
      res.json({
        message: 'Favicon uploaded successfully',
        faviconUrl: fileUrl
      });
    } catch (error) {
      console.error('Error uploading favicon:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// @desc    Upload login background for an organization
// @route   POST /api/white-label/:organizationId/upload-background
// @access  Private/Organization Admin
exports.uploadBackground = async (req, res) => {
  const uploadSingle = upload.single('background');
  
  uploadSingle(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      const { organizationId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Get white label settings
      let settings = await WhiteLabelSettings.findOne({
        where: { organizationId }
      });
      
      // Generate URL for the uploaded file
      const fileUrl = `/uploads/${organizationId}/${req.file.filename}`;
      
      // If settings don't exist, create them
      if (!settings) {
        settings = await WhiteLabelSettings.create({
          organizationId,
          loginBackgroundUrl: fileUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        // Update background URL
        await settings.update({
          loginBackgroundUrl: fileUrl,
          updatedAt: new Date()
        });
      }
      
      res.json({
        message: 'Background uploaded successfully',
        backgroundUrl: fileUrl
      });
    } catch (error) {
      console.error('Error uploading background:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// @desc    Get white label settings by domain
// @route   GET /api/white-label/domain/:domain
// @access  Public
exports.getWhiteLabelSettingsByDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    
    // Find organization by custom domain
    const organization = await Organization.findOne({
      where: { customDomain: domain }
    });
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Get white label settings
    const settings = await WhiteLabelSettings.findOne({
      where: { organizationId: organization.id }
    });
    
    if (!settings) {
      return res.status(404).json({ message: 'White label settings not found' });
    }
    
    // Return public white label settings
    res.json({
      companyName: settings.companyName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      privacyPolicyUrl: settings.privacyPolicyUrl,
      termsOfServiceUrl: settings.termsOfServiceUrl,
      faviconUrl: settings.faviconUrl,
      logoUrl: settings.logoUrl,
      loginBackgroundUrl: settings.loginBackgroundUrl,
      customCss: settings.customCss,
      customJs: settings.customJs,
      primaryColor: organization.primaryColor,
      secondaryColor: organization.secondaryColor
    });
  } catch (error) {
    console.error('Error fetching white label settings by domain:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
