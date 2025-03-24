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
      user: req.user._id,
      name,
      description,
      retellAgentId: retellResponse.retellAgentId,
      voiceId
    });

    // Create LLM configuration in our database
    const llmConfiguration = await LLMConfiguration.create({
      agent: agent._id,
      retellLlmId: retellResponse.retellLlmId,
      model: llmConfig.model,
      s2sModel: llmConfig.s2sModel,
      temperature: llmConfig.temperature,
      highPriority: llmConfig.highPriority,
      generalPrompt: llmConfig.generalPrompt
    });

    res.status(201).json({
      _id: agent._id,
      name: agent.name,
      description: agent.description,
      retellAgentId: agent.retellAgentId,
      voiceId: agent.voiceId,
      llmConfiguration: {
        _id: llmConfiguration._id,
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
    const agents = await Agent.find({ user: req.user._id }).populate('user', 'username email');
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
    const agent = await Agent.findById(req.params.id).populate('user', 'username email');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if agent belongs to user
    if (agent.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get LLM configuration
    const llmConfiguration = await LLMConfiguration.findOne({ agent: agent._id });

    res.json({
      _id: agent._id,
      name: agent.name,
      description: agent.description,
      retellAgentId: agent.retellAgentId,
      voiceId: agent.voiceId,
      user: agent.user,
      llmConfiguration: llmConfiguration
    });
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
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if agent belongs to user
    if (agent.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { name, description, voiceId, llmConfig } = req.body;

    // Update agent in Retell if voiceId or llmConfig changed
    if (voiceId !== agent.voiceId || llmConfig) {
      let llmId = null;
      
      // If LLM config is provided, update or create new LLM in Retell
      if (llmConfig) {
        const llmConfiguration = await LLMConfiguration.findOne({ agent: agent._id });
        
        if (llmConfiguration) {
          // Update LLM configuration in our database
          llmConfiguration.model = llmConfig.model || llmConfiguration.model;
          llmConfiguration.s2sModel = llmConfig.s2sModel || llmConfiguration.s2sModel;
          llmConfiguration.temperature = llmConfig.temperature !== undefined ? llmConfig.temperature : llmConfiguration.temperature;
          llmConfiguration.highPriority = llmConfig.highPriority !== undefined ? llmConfig.highPriority : llmConfiguration.highPriority;
          llmConfiguration.generalPrompt = llmConfig.generalPrompt || llmConfiguration.generalPrompt;
          
          await llmConfiguration.save();
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
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if agent belongs to user
    if (agent.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete agent from Retell
    await retellService.deleteRetellAgent(agent.retellAgentId);

    // Delete agent from our database
    await agent.remove();

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
