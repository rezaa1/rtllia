const Agent = require('../models/Agent');
const LLMConfiguration = require('../models/LLMConfiguration');
const retellService = require('../services/retellService');
const sequelize = require('../config/database');

// @desc    Create a new agent
// @route   POST /api/agents
// @access  Private
const createAgent = async (req, res) => {
  // Use a transaction to ensure both agent and LLM configuration are created together
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, voiceId, llmConfig } = req.body;

    if (!name || !voiceId || !llmConfig) {
      return res.status(400).json({ 
        message: 'Please provide name, voiceId, and LLM configuration' 
      });
    }

    console.log('Creating agent with data:', {
      name,
      description,
      voiceId,
      llmConfig,
      userId: req.user.id,
      organizationId: req.user.organizationId
    });

    let retellResponse;
    try {
      // Create agent in Retell first
      retellResponse = await retellService.createRetellAgent(voiceId, llmConfig);
      
      if (!retellResponse || !retellResponse.retellAgentId || !retellResponse.retellLlmId) {
        throw new Error('Invalid response from Retell API');
      }
      
      console.log('Successfully created agent in RetellAI:', retellResponse);
    } catch (retellError) {
      console.error('Retell API Error:', retellError);
      await transaction.rollback();
      return res.status(500).json({ 
        message: 'Failed to create agent in Retell',
        error: retellError.message 
      });
    }

    // Start database transaction
    console.log('Creating agent in database with RetellAI IDs:', {
      retellAgentId: retellResponse.retellAgentId,
      retellLlmId: retellResponse.retellLlmId
    });
    
    const agent = await Agent.create({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      name,
      description,
      retellAgentId: retellResponse.retellAgentId,
      voiceId,
      isActive: true
    }, { transaction });
    
    console.log('Successfully created agent in database:', agent.toJSON());

    // Create LLM configuration
    const llmConfiguration = await LLMConfiguration.create({
      agentId: agent.id,
      retellLlmId: retellResponse.retellLlmId,
      model: llmConfig.model,
      s2sModel: llmConfig.s2sModel || null,
      temperature: llmConfig.temperature || 0,
      highPriority: llmConfig.highPriority || false,
      generalPrompt: llmConfig.generalPrompt || ''
    }, { transaction });
    
    console.log('Successfully created LLM configuration in database:', llmConfiguration.toJSON());

    // Commit the transaction
    await transaction.commit();
    console.log('Transaction committed successfully');

    // Return success response
    res.status(201).json({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      retellAgentId: agent.retellAgentId,
      voiceId: agent.voiceId,
      llmConfiguration: {
        id: llmConfiguration.id,
        model: llmConfiguration.model,
        s2sModel: llmConfiguration.s2sModel,
        temperature: llmConfiguration.temperature,
        highPriority: llmConfiguration.highPriority,
        generalPrompt: llmConfiguration.generalPrompt
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    await transaction.rollback();
    console.log('Transaction rolled back due to error');
    res.status(500).json({ 
      message: 'Failed to create agent in database',
      error: error.message 
    });
  }
};

// @desc    Get all agents for a user
// @route   GET /api/agents
// @access  Private
const getAgents = async (req, res) => {
  try {
    console.log('Getting agents for user:', {
      userId: req.user.id,
      organizationId: req.user.organizationId
    });
    
    // Get all agents without including LLMConfiguration
    const agents = await Agent.findAll({
      where: { 
        organizationId: req.user.organizationId,
        userId: req.user.id
      }
    });
    
    console.log(`Found ${agents.length} agents in database`);
    
    if (agents.length === 0) {
      console.log('No agents found for this user');
      return res.json([]);
    }
    
    // Log each agent for debugging
    agents.forEach((agent, index) => {
      console.log(`Agent ${index + 1}:`, agent.toJSON());
    });
    
    // Get LLM configurations separately
    const agentIds = agents.map(agent => agent.id);
    console.log('Getting LLM configurations for agent IDs:', agentIds);
    
    const llmConfigurations = await LLMConfiguration.findAll({
      where: {
        agentId: agentIds
      }
    });
    
    console.log(`Found ${llmConfigurations.length} LLM configurations`);
    
    // Map LLM configurations to agents
    const agentsWithLLM = agents.map(agent => {
      const agentData = agent.toJSON();
      const llmConfig = llmConfigurations.find(config => config.agentId === agent.id);
      if (llmConfig) {
        agentData.LLMConfiguration = {
          model: llmConfig.model,
          s2sModel: llmConfig.s2sModel,
          temperature: llmConfig.temperature,
          highPriority: llmConfig.highPriority,
          generalPrompt: llmConfig.generalPrompt
        };
      } else {
        console.log(`No LLM configuration found for agent ID ${agent.id}`);
      }
      return agentData;
    });
    
    console.log('Returning agents with LLM configurations');
    res.json(agentsWithLLM);
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get agent by ID
// @route   GET /api/agents/:id
// @access  Private
const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      where: {
        id: req.params.id,
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
    
    // Get LLM configuration separately
    const llmConfiguration = await LLMConfiguration.findOne({
      where: { agentId: agent.id }
    });
    
    const agentData = agent.toJSON();
    if (llmConfiguration) {
      agentData.LLMConfiguration = {
        model: llmConfiguration.model,
        s2sModel: llmConfiguration.s2sModel,
        temperature: llmConfiguration.temperature,
        highPriority: llmConfiguration.highPriority,
        generalPrompt: llmConfiguration.generalPrompt
      };
    }

    res.json(agentData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update agent
// @route   PUT /api/agents/:id
// @access  Private
const updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
        userId: req.user.id
      }
    });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const { name, description, voiceId, llmConfig } = req.body;

    // Update agent in Retell if voiceId or llmConfig changed
    if (voiceId !== agent.voiceId || llmConfig) {
      let llmId = null;
      
      // If LLM config is provided, update or create new LLM in Retell
      if (llmConfig) {
        const llmConfiguration = await LLMConfiguration.findOne({
          where: { agentId: agent.id }
        });
        
        if (llmConfiguration) {
          // Update LLM configuration in our database
          await llmConfiguration.update({
            model: llmConfig.model || llmConfiguration.model,
            s2sModel: llmConfig.s2sModel || llmConfiguration.s2sModel,
            temperature: llmConfig.temperature !== undefined ? llmConfig.temperature : llmConfiguration.temperature,
            highPriority: llmConfig.highPriority !== undefined ? llmConfig.highPriority : llmConfiguration.highPriority,
            generalPrompt: llmConfig.generalPrompt || llmConfiguration.generalPrompt
          });
          llmId = llmConfiguration.retellLlmId;
        }
      }

      // Update agent in Retell
      await retellService.updateRetellAgent(agent.retellAgentId, voiceId || agent.voiceId, llmId);
    }

    // Update agent in our database
    agent.name = name || agent.name;
    agent.description = description || agent.description;
    agent.voiceId = voiceId || agent.voiceId;
    
    const updatedAgent = await agent.save();

    res.json(updatedAgent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete agent
// @route   DELETE /api/agents/:id
// @access  Private
const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
        userId: req.user.id
      }
    });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Delete agent from Retell
    await retellService.deleteRetellAgent(agent.retellAgentId);

    // Delete agent from our database
    await agent.destroy();

    res.json({ message: 'Agent removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent
};
