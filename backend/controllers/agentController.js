const { Agent, LLMConfiguration } = require('../models');
const sequelize = require('../config/database');
const retellService = require('../services/retellService');

// @route   POST /api/agents
// @access  Private
const createAgent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Creating agent with data:', {
      ...req.body,
      userId: req.user.id,
      organizationId: req.user.organizationId
    });
    
    // Create agent in Retell
    const { retellAgentId, retellLlmId } = await retellService.createRetellAgent(
      req.body.voiceId,
      req.body.llmConfig
    );
    
    // Create agent in database
    const agent = await Agent.create({
      name: req.body.name,
      description: req.body.description || '',
      retellAgentId,
      voiceId: req.body.voiceId,
      userId: req.user.id,
      organizationId: req.user.organizationId,
      isActive: true
    }, { transaction });
    
    // Create LLM configuration
    const llmConfig = await LLMConfiguration.create({
      agentId: agent.id,
      model: req.body.llmConfig.model || null,
      s2sModel: req.body.llmConfig.s2sModel || null,
      temperature: req.body.llmConfig.temperature || 0,
      highPriority: req.body.llmConfig.highPriority || false,
      generalPrompt: req.body.llmConfig.generalPrompt || '',
      retellLlmId
    }, { transaction });
    
    // Commit transaction
    await transaction.commit();
    console.log('Transaction committed successfully');
    
    res.status(201).json({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      retellAgentId,
      voiceId: agent.voiceId,
      llmConfig: {
        id: llmConfig.id,
        model: llmConfig.model,
        s2sModel: llmConfig.s2sModel,
        temperature: llmConfig.temperature,
        highPriority: llmConfig.highPriority,
        generalPrompt: llmConfig.generalPrompt,
        retellLlmId
      }
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error('Transaction rolled back due to error:', error);
    
    res.status(500).json({
      message: error.message || 'Failed to create agent'
    });
  }
};

// @route   GET /api/agents
// @access  Private
const getAgents = async (req, res) => {
  try {
    console.log('Getting agents for user:', req.user.id, 'in organization:', req.user.organizationId);
    
    // Get all agents for user
    const agents = await Agent.findAll({
      where: {
        userId: req.user.id,
        organizationId: req.user.organizationId
      },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${agents.length} agents for user ${req.user.id}`);
    
    // Get LLM configurations for these agents
    const agentIds = agents.map(agent => agent.id);
    const llmConfigurations = await LLMConfiguration.findAll({
      where: {
        agentId: agentIds
      }
    });
    
    console.log(`Found ${llmConfigurations.length} LLM configurations for ${agentIds.length} agents`);
    
    // Map LLM configurations to agents
    const agentsWithConfig = agents.map(agent => {
      const llmConfig = llmConfigurations.find(config => config.agentId === agent.id);
      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        retellAgentId: agent.retellAgentId,
        voiceId: agent.voiceId,
        isActive: agent.isActive,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
        llmConfig: llmConfig ? {
          id: llmConfig.id,
          model: llmConfig.model,
          s2sModel: llmConfig.s2sModel,
          temperature: llmConfig.temperature,
          highPriority: llmConfig.highPriority,
          generalPrompt: llmConfig.generalPrompt,
          retellLlmId: llmConfig.retellLlmId
        } : null
      };
    });
    
    res.json(agentsWithConfig);
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({
      message: error.message || 'Failed to get agents'
    });
  }
};

// @route   GET /api/agents/:id
// @access  Private
const getAgentById = async (req, res) => {
  try {
    // Validate agent ID
    const agentId = req.params.retell_agent_id;
    
    if (!agentId || agentId === 'undefined') {
      console.error('Invalid agent ID:', agentId);
      return res.status(400).json({ message: 'Invalid agent ID' });
    }
    
    // Convert to integer if it's a string
    const parsedId = parseInt(agentId, 10);
    
    if (isNaN(parsedId)) {
      console.error('Agent ID is not a valid number:', agentId);
      return res.status(400).json({ message: 'Agent ID must be a valid number' });
    }
    
    console.log('Getting agent by ID:', parsedId, 'for user:', req.user.id, 'in organization:', req.user.organizationId);
    
    const agent = await Agent.findOne({
      where: {
        id: parsedId,
        organizationId: req.user.organizationId
      }
    });
    
    if (!agent) {
      console.log('Agent not found with ID:', parsedId);
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if agent belongs to user
    if (agent.userId !== req.user.id) {
      console.log('User not authorized to view agent:', agent.id);
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Get LLM configuration for this agent
    const llmConfig = await LLMConfiguration.findOne({
      where: {
        agentId: agent.id
      }
    });
    
    console.log('Found agent:', agent.id, 'with LLM config:', llmConfig ? llmConfig.id : 'none');
    
    const agentData = await retellService.getAgentById(parsedId);
    console.log('Fetched agent data:', agentData);
    
    res.json({
      _id: agent.id,
      id: agent.id,
      name: agent.name,
      description: agent.description,
      retellAgentId: agent.retellAgentId,
      voiceId: agent.voiceId,
      isActive: agent.isActive,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      llmConfig: llmConfig ? {
        id: llmConfig.id,
        model: llmConfig.model,
        s2sModel: llmConfig.s2sModel,
        temperature: llmConfig.temperature,
        highPriority: llmConfig.highPriority,
        generalPrompt: llmConfig.generalPrompt,
        retellLlmId: llmConfig.retellLlmId
      } : null
    });
  } catch (error) {
    console.error('Error getting agent by ID:', error);
    res.status(500).json({
      message: error.message || 'Failed to get agent'
    });
  }
};

// @route   PUT /api/agents/:id
// @access  Private
const updateAgent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Validate agent ID
    const agentId = req.params.id;
    
    if (!agentId || agentId === 'undefined') {
      console.error('Invalid agent ID:', agentId);
      return res.status(400).json({ message: 'Invalid agent ID' });
    }
    
    // Convert to integer if it's a string
    const parsedId = parseInt(agentId, 10);
    
    if (isNaN(parsedId)) {
      console.error('Agent ID is not a valid number:', agentId);
      return res.status(400).json({ message: 'Agent ID must be a valid number' });
    }
    
    const agent = await Agent.findOne({
      where: {
        id: parsedId,
        organizationId: req.user.organizationId
      }
    });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Check if agent belongs to user
    if (agent.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update agent in Retell
    await retellService.updateRetellAgent(
      agent.retellAgentId,
      req.body.voiceId,
      req.body.llmConfig
    );
    
    // Update agent in database
    await agent.update({
      name: req.body.name,
      description: req.body.description || '',
      voiceId: req.body.voiceId
    }, { transaction });
    
    // Update LLM configuration
    const llmConfig = await LLMConfiguration.findOne({
      where: {
        agentId: agent.id
      }
    });
    
    if (llmConfig) {
      await llmConfig.update({
        model: req.body.llmConfig.model || null,
        s2sModel: req.body.llmConfig.s2sModel || null,
        temperature: req.body.llmConfig.temperature || 0,
        highPriority: req.body.llmConfig.highPriority || false,
        generalPrompt: req.body.llmConfig.generalPrompt || ''
      }, { transaction });
    }
    
    // Commit transaction
    await transaction.commit();
    
    res.json({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      retellAgentId: agent.retellAgentId,
      voiceId: agent.voiceId,
      llmConfig: llmConfig ? {
        id: llmConfig.id,
        model: llmConfig.model,
        s2sModel: llmConfig.s2sModel,
        temperature: llmConfig.temperature,
        highPriority: llmConfig.highPriority,
        generalPrompt: llmConfig.generalPrompt,
        retellLlmId: llmConfig.retellLlmId
      } : null
    });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    res.status(500).json({
      message: error.message || 'Failed to update agent'
    });
  }
};

// @route   DELETE /api/agents/:id
// @access  Private
const deleteAgent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Validate agent ID
    const agentId = req.params.id;
    
    if (!agentId || agentId === 'undefined') {
      console.error('Invalid agent ID:', agentId);
      return res.status(400).json({ message: 'Invalid agent ID' });
    }
    
    // Convert to integer if it's a string
    const parsedId = parseInt(agentId, 10);
    
    if (isNaN(parsedId)) {
      console.error('Agent ID is not a valid number:', agentId);
      return res.status(400).json({ message: 'Agent ID must be a valid number' });
    }
    
    const agent = await Agent.findOne({
      where: {
        id: parsedId,
        organizationId: req.user.organizationId
      }
    });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    // Check if agent belongs to user
    if (agent.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Delete agent from Retell
    await retellService.deleteRetellAgent(agent.retellAgentId);
    
    // Delete LLM configuration
    await LLMConfiguration.destroy({
      where: {
        agentId: agent.id
      },
      transaction
    });
    
    // Delete agent from database
    await agent.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    res.status(500).json({
      message: error.message || 'Failed to delete agent'
    });
  }
};

module.exports = {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent
};
