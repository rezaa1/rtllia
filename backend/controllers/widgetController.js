const WidgetConfiguration = require('../models/chat/WidgetConfiguration');
const Agent = require('../models/Agent');

// @desc    Create a new widget configuration
// @route   POST /api/widgets
// @access  Private
const createWidgetConfiguration = async (req, res) => {
  try {
    const { name, agentId, themeColor, headerText, welcomeMessage, allowedDomains } = req.body;

    // Validate input data
    if (!name || !agentId) {
      return res.status(400).json({ message: 'Name and Agent ID are required' });
    }

    // Check if agent exists and belongs to organization
    const agent = await Agent.findOne({
      where: {
        id: agentId,
        organizationId: req.user.organizationId
      }
    });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Create widget configuration
    const widgetConfig = await WidgetConfiguration.create({
      organization_id: req.user.organizationId,
      name,
      agent_id: agentId,
      theme_color: themeColor || '#0088FF',
      header_text: headerText || 'Chat with us',
      welcome_message: welcomeMessage,
      allowed_domains: allowedDomains || [],
      is_active: true
    });

    res.status(201).json({
      id: widgetConfig.id,
      organizationId: widgetConfig.organization_id,
      name: widgetConfig.name,
      agentId: widgetConfig.agent_id,
      themeColor: widgetConfig.theme_color,
      headerText: widgetConfig.header_text,
      welcomeMessage: widgetConfig.welcome_message,
      allowedDomains: widgetConfig.allowed_domains,
      isActive: widgetConfig.is_active,
      createdAt: widgetConfig.created_at
    });
  } catch (error) {
    console.error('Error creating widget configuration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get widget configuration by ID
// @route   GET /api/widgets/:id
// @access  Private
const getWidgetConfigurationById = async (req, res) => {
  try {
    const widgetConfig = await WidgetConfiguration.findOne({
      where: {
        id: req.params.id,
        organization_id: req.user.organizationId
      }
    });
    
    if (!widgetConfig) {
      return res.status(404).json({ message: 'Widget configuration not found' });
    }

    res.json({
      id: widgetConfig.id,
      organizationId: widgetConfig.organization_id,
      name: widgetConfig.name,
      agentId: widgetConfig.agent_id,
      themeColor: widgetConfig.theme_color,
      headerText: widgetConfig.header_text,
      welcomeMessage: widgetConfig.welcome_message,
      allowedDomains: widgetConfig.allowed_domains,
      isActive: widgetConfig.is_active,
      createdAt: widgetConfig.created_at,
      updatedAt: widgetConfig.updated_at
    });
  } catch (error) {
    console.error('Error getting widget configuration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update widget configuration
// @route   PUT /api/widgets/:id
// @access  Private
const updateWidgetConfiguration = async (req, res) => {
  try {
    const { name, agentId, themeColor, headerText, welcomeMessage, allowedDomains, isActive } = req.body;
    
    const widgetConfig = await WidgetConfiguration.findOne({
      where: {
        id: req.params.id,
        organization_id: req.user.organizationId
      }
    });
    
    if (!widgetConfig) {
      return res.status(404).json({ message: 'Widget configuration not found' });
    }

    // If agent ID is changing, verify new agent
    if (agentId && agentId !== widgetConfig.agent_id) {
      const agent = await Agent.findOne({
        where: {
          id: agentId,
          organizationId: req.user.organizationId
        }
      });
      
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (agentId) updateData.agent_id = agentId;
    if (themeColor) updateData.theme_color = themeColor;
    if (headerText) updateData.header_text = headerText;
    if (welcomeMessage !== undefined) updateData.welcome_message = welcomeMessage;
    if (allowedDomains) updateData.allowed_domains = allowedDomains;
    if (isActive !== undefined) updateData.is_active = isActive;
    
    // Update widget configuration
    await widgetConfig.update(updateData);

    res.json({
      id: widgetConfig.id,
      organizationId: widgetConfig.organization_id,
      name: widgetConfig.name,
      agentId: widgetConfig.agent_id,
      themeColor: widgetConfig.theme_color,
      headerText: widgetConfig.header_text,
      welcomeMessage: widgetConfig.welcome_message,
      allowedDomains: widgetConfig.allowed_domains,
      isActive: widgetConfig.is_active,
      createdAt: widgetConfig.created_at,
      updatedAt: widgetConfig.updated_at
    });
  } catch (error) {
    console.error('Error updating widget configuration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete widget configuration
// @route   DELETE /api/widgets/:id
// @access  Private
const deleteWidgetConfiguration = async (req, res) => {
  try {
    const widgetConfig = await WidgetConfiguration.findOne({
      where: {
        id: req.params.id,
        organization_id: req.user.organizationId
      }
    });
    
    if (!widgetConfig) {
      return res.status(404).json({ message: 'Widget configuration not found' });
    }

    // Delete widget configuration
    await widgetConfig.destroy();

    res.json({ message: 'Widget configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting widget configuration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all widget configurations for an organization
// @route   GET /api/widgets/organization/:orgId
// @access  Private
const getWidgetConfigurationsByOrganization = async (req, res) => {
  try {
    // Ensure user belongs to the organization
    if (req.user.organizationId !== parseInt(req.params.orgId)) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const widgetConfigs = await WidgetConfiguration.findAll({
      where: {
        organization_id: req.params.orgId
      },
      order: [['created_at', 'DESC']]
    });

    const formattedConfigs = widgetConfigs.map(config => ({
      id: config.id,
      organizationId: config.organization_id,
      name: config.name,
      agentId: config.agent_id,
      themeColor: config.theme_color,
      headerText: config.header_text,
      welcomeMessage: config.welcome_message,
      allowedDomains: config.allowed_domains,
      isActive: config.is_active,
      createdAt: config.created_at,
      updatedAt: config.updated_at
    }));

    res.json(formattedConfigs);
  } catch (error) {
    console.error('Error getting widget configurations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createWidgetConfiguration,
  getWidgetConfigurationById,
  updateWidgetConfiguration,
  deleteWidgetConfiguration,
  getWidgetConfigurationsByOrganization
};
