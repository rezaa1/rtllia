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
    const agent = await Agent.findById(agentId);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (agent.user.toString() !== req.user._id.toString()) {
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
      agent: agent._id,
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
    const agents = await Agent.find({ user: req.user._id });
    const agentIds = agents.map(agent => agent._id);
    
    // Find all calls for these agents
    const calls = await Call.find({ agent: { $in: agentIds } })
      .populate('agent', 'name retellAgentId')
      .sort({ createdAt: -1 });
    
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
    const call = await Call.findById(req.params.id)
      .populate('agent', 'name retellAgentId user');
    
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Check if call belongs to user's agent
    if (call.agent.user.toString() !== req.user._id.toString()) {
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
    const call = await Call.findById(req.params.id);
    
    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Get agent to check ownership
    const agent = await Agent.findById(call.agent);
    
    if (!agent || agent.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { status, duration, endedAt } = req.body;

    // Update call in our database
    call.status = status || call.status;
    
    if (duration) {
      call.duration = duration;
    }
    
    if (endedAt) {
      call.endedAt = endedAt;
    }
    
    const updatedCall = await call.save();

    res.json(updatedCall);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createCall,
  getCalls,
  getCallById,
  updateCallStatus
};