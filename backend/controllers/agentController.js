const Agent = require('../models/Agent');
const LLMConfiguration = require('../models/LLMConfiguration');
const retellService = require('../services/retellService');

// @desc    Create a new agent
// @route   POST /api/agents
// @access  Private
const createAgent = async (req, res) => {
  try {
    const { name, description, voiceId, llmConfig } = req.body;

    // Create agent in Retell
    const retellResponse = await retellService.createRetellAgent(voiceId, llmConfig);

    // Create agent in our database
    const agent = await Agent.create({
      organizationId: req.user.organizationId, // Add organizationId from authenticated user
      userId: req.user.id, // Add userId from authenticated user
      name,
      description,
      retellAgentId: retellResponse.retellAgentId,
      voiceId
    });

    // Create LLM configuration in our database
    const llmConfiguration = await LLMConfiguration.create({
      agentId: agent.id,
      retellLlmId: retellResponse.retellLlmId,
      model: llmConfig.model,
      s2sModel: llmConfig.s2sModel,
      temperature: llmConfig.temperature,
      highPriority: llmConfig.highPriority,
      generalPrompt: llmConfig.generalPrompt
    });

    res.status(201).json({
      _id: agent.id,
      name: agent.name,
      description: agent.description,
      retellAgentId: agent.retellAgentId,
      voiceId: agent.voiceId,
      llmConfiguration: {
        _id: llmConfiguration.id,
        model: llmConfiguration.model,
        s2sModel: llmConfiguration.s2sModel,
        temperature: llmConfiguration.temperature,
        highPriority: llmConfiguration.highPriority,
        generalPrompt: llmConfiguration.generalPrompt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all agents for a user
// @route   GET /api/agents
// @access  Private
const getAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll({
      where: { 
        organizationId: req.user.organizationId,
        userId: req.user.id
      },
      include: [{
        model: LLMConfiguration,
        attributes: ['model', 's2sModel', 'temperature', 'highPriority', 'generalPrompt']
      }]
    });
    res.json(agents);
  } catch (error) {
    console.error(error);
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
      },
      include: [{
        model: LLMConfiguration,
        attributes: ['model', 's2sModel', 'temperature', 'highPriority', 'generalPrompt']
      }]
    });
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if agent belongs to user
    if (agent.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(agent);
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