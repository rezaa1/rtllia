const Call = require('../models/Call');
const Agent = require('../models/Agent');
const retellService = require('../services/retellService');

// @desc    Create a new phone call
// @route   POST /api/calls
// @access  Private
const createCall = async (req, res) => {
  try {
    const { agentId, fromNumber, toNumber } = req.body;

    // Check if agent exists and belongs to user
    const agent = await Agent.findByPk(agentId);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (agent.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Create call in Retell
    const retellResponse = await retellService.createPhoneCall(
      fromNumber,
      toNumber,
      agent.retellAgentId
    );

    // Create call in our database
    const call = await Call.create({
      agentId: agent.id,
      retellCallId: retellResponse.retellCallId,
      fromNumber,
      toNumber,
      direction: 'outbound',
      status: retellResponse.status,
      startedAt: new Date()
    });

    res.status(201).json(call);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all calls for a user
// @route   GET /api/calls
// @access  Private
const getCalls = async (req, res) => {
  try {
    // Find all agents belonging to the user
    const agents = await Agent.findAll({
      where: { 
        organizationId: req.user.organizationId,
        userId: req.user.id
      }
    });
    const agentIds = agents.map(agent => agent.id);
    
    // Find all calls for these agents
    const calls = await Call.findAll({
      where: { agentId: agentIds },
      include: [{
        model: Agent,
        attributes: ['name', 'retellAgentId']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('Retrieved calls:', calls); // Log the calls fetched

    res.json(calls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get call by ID
// @route   GET /api/calls/:id
// @access  Private
const getCallById = async (req, res) => {
  try {
    const call = await Call.findByPk(req.params.id, {
      include: [{
        model: Agent,
        attributes: ['name', 'retellAgentId', 'userId']
      }]
    });
    
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Check if call belongs to user's agent
    if (call.Agent.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(call);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update call status
// @route   PUT /api/calls/:id
// @access  Private
const updateCallStatus = async (req, res) => {
  try {
    const call = await Call.findByPk(req.params.id);
    
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Get agent to check ownership
    const agent = await Agent.findByPk(call.agentId);
    
    if (!agent || agent.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { status, duration, endedAt } = req.body;

    // Update call in our database
    if (status) call.status = status;
    if (duration) call.duration = duration;
    if (endedAt) call.endedAt = endedAt;
    
    const updatedCall = await call.save();

    res.json(updatedCall);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get call history for a user
// @route   GET /api/calls/history
// @access  Private
const getCallHistory = async (req, res) => {
  try {
    const calls = await Call.findAll({
      where: { agentId: req.user.agentId }, // Adjust based on your logic
      order: [['startedAt', 'DESC']]
    });

    if (calls.length === 0) {
      return res.status(404).json({ message: 'No call history found' });
    }

    res.status(200).json(calls);
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createCall,
  getCalls,
  getCallById,
  updateCallStatus,
  getCallHistory
};
