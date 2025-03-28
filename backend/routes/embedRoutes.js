const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { WidgetConfiguration } = require('../models/chat');
const { protect } = require('../middleware/authMiddleware');

// @desc    Authenticate widget embedding
// @route   POST /embed/auth
// @access  Public
const authenticateWidget = async (req, res) => {
  try {
    const { widgetId, domain, visitorId } = req.body;
    
    if (!widgetId || !domain || !visitorId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // Find widget configuration
    const widgetConfig = await WidgetConfiguration.findByPk(widgetId);
    
    if (!widgetConfig) {
      return res.status(404).json({ message: 'Widget configuration not found' });
    }
    
    // Check if widget is active
    if (!widgetConfig.is_active) {
      return res.status(403).json({ message: 'Widget is not active' });
    }
    
    // Check if domain is allowed
    if (widgetConfig.allowed_domains && widgetConfig.allowed_domains.length > 0) {
      const isAllowed = widgetConfig.allowed_domains.some(allowedDomain => {
        // Allow wildcard subdomains
        if (allowedDomain.startsWith('*.')) {
          const baseDomain = allowedDomain.substring(2);
          return domain === baseDomain || domain.endsWith('.' + baseDomain);
        }
        return domain === allowedDomain;
      });
      
      if (!isAllowed) {
        return res.status(403).json({ message: 'Domain not allowed' });
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        widgetId: widgetConfig.id,
        organizationId: widgetConfig.organization_id,
        agentId: widgetConfig.agent_id,
        visitorId
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      agentId: widgetConfig.agent_id,
      themeColor: widgetConfig.theme_color,
      headerText: widgetConfig.header_text
    });
  } catch (error) {
    console.error('Error authenticating widget:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Serve widget embedding script
// @route   GET /embed/widget.js
// @access  Public
const serveWidgetScript = (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile('widget.js', { root: 'public' });
};

// @desc    Serve widget frame HTML
// @route   GET /embed/widget-frame.html
// @access  Public
const serveWidgetFrame = (req, res) => {
  res.sendFile('widget-frame.html', { root: 'public' });
};

// @desc    Serve widget frame script
// @route   GET /embed/widget-frame.js
// @access  Public
const serveWidgetFrameScript = (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile('widget-frame.js', { root: 'public' });
};

// @desc    Get widget configuration
// @route   GET /embed/config/:widgetId
// @access  Public
const getWidgetConfig = async (req, res) => {
  try {
    const widgetId = req.params.widgetId;
    
    // Find widget configuration
    const widgetConfig = await WidgetConfiguration.findByPk(widgetId);
    
    if (!widgetConfig) {
      return res.status(404).json({ message: 'Widget configuration not found' });
    }
    
    // Check if widget is active
    if (!widgetConfig.is_active) {
      return res.status(403).json({ message: 'Widget is not active' });
    }
    
    // Return public configuration
    res.json({
      id: widgetConfig.id,
      agentId: widgetConfig.agent_id,
      themeColor: widgetConfig.theme_color,
      headerText: widgetConfig.header_text,
      welcomeMessage: widgetConfig.welcome_message
    });
  } catch (error) {
    console.error('Error getting widget configuration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Routes
router.post('/auth', authenticateWidget);
router.get('/widget.js', serveWidgetScript);
router.get('/widget-frame.html', serveWidgetFrame);
router.get('/widget-frame.js', serveWidgetFrameScript);
router.get('/config/:widgetId', getWidgetConfig);

module.exports = router;
