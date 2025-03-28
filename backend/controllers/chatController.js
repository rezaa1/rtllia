const ChatSession = require('../models/chat/ChatSession');
const ChatMessage = require('../models/chat/ChatMessage');
const Agent = require('../models/Agent');
const retellService = require('../services/retellService');
const chatService = require('../services/chatService');

// @desc    Create a new chat session
// @route   POST /api/chat/sessions
// @access  Private
const createChatSession = async (req, res) => {
  try {
    const { agentId, visitorId, metadata } = req.body;

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

    // Create chat session
    const chatSession = await ChatSession.create({
      organization_id: req.user.organizationId,
      agent_id: agentId,
      visitor_id: visitorId,
      status: 'active',
      metadata: metadata || {}
    });

    // If welcome message is provided, create system message
    if (req.body.welcomeMessage) {
      await ChatMessage.create({
        chat_session_id: chatSession.id,
        sender_type: 'agent',
        message_type: 'text',
        content: req.body.welcomeMessage
      });
    }

    res.status(201).json({
      id: chatSession.id,
      organizationId: chatSession.organization_id,
      agentId: chatSession.agent_id,
      visitorId: chatSession.visitor_id,
      status: chatSession.status,
      metadata: chatSession.metadata,
      createdAt: chatSession.created_at
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get chat session by ID
// @route   GET /api/chat/sessions/:id
// @access  Private
const getChatSessionById = async (req, res) => {
  try {
    const chatSession = await ChatSession.findOne({
      where: {
        id: req.params.id,
        organization_id: req.user.organizationId
      }
    });
    
    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({
      id: chatSession.id,
      organizationId: chatSession.organization_id,
      agentId: chatSession.agent_id,
      visitorId: chatSession.visitor_id,
      status: chatSession.status,
      metadata: chatSession.metadata,
      createdAt: chatSession.created_at,
      updatedAt: chatSession.updated_at,
      endedAt: chatSession.ended_at
    });
  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get messages for a chat session
// @route   GET /api/chat/sessions/:id/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const chatSession = await ChatSession.findOne({
      where: {
        id: req.params.id,
        organization_id: req.user.organizationId
      }
    });
    
    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    const messages = await ChatMessage.findAll({
      where: {
        chat_session_id: chatSession.id
      },
      order: [['created_at', 'ASC']]
    });

    const formattedMessages = messages.map(message => ({
      id: message.id,
      sessionId: message.chat_session_id,
      senderType: message.sender_type,
      messageType: message.message_type,
      content: message.content,
      voiceUrl: message.voice_url,
      metadata: message.metadata,
      createdAt: message.created_at
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send a message in a chat session
// @route   POST /api/chat/sessions/:id/messages
// @access  Private
const sendChatMessage = async (req, res) => {
  try {
    const { content, messageType, metadata } = req.body;
    const sessionId = req.params.id;

    // Check if chat session exists and belongs to organization
    const chatSession = await ChatSession.findOne({
      where: {
        id: sessionId,
        organization_id: req.user.organizationId
      }
    });
    
    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Check if session is active
    if (chatSession.status !== 'active') {
      return res.status(400).json({ message: 'Chat session is not active' });
    }

    // Create user message
    const userMessage = await ChatMessage.create({
      chat_session_id: sessionId,
      sender_type: 'user',
      message_type: messageType || 'text',
      content,
      metadata: metadata || {}
    });

    // Get agent response using chat service
    const agentResponse = await chatService.getAgentResponse(
      chatSession.agent_id,
      sessionId,
      content
    );

    // Create agent message
    const agentMessage = await ChatMessage.create({
      chat_session_id: sessionId,
      sender_type: 'agent',
      message_type: 'text',
      content: agentResponse.message,
      metadata: agentResponse.metadata || {}
    });

    // Update session last activity
    await chatSession.update({
      updated_at: new Date()
    });

    res.status(201).json({
      userMessage: {
        id: userMessage.id,
        sessionId: userMessage.chat_session_id,
        senderType: userMessage.sender_type,
        messageType: userMessage.message_type,
        content: userMessage.content,
        metadata: userMessage.metadata,
        createdAt: userMessage.created_at
      },
      agentMessage: {
        id: agentMessage.id,
        sessionId: agentMessage.chat_session_id,
        senderType: agentMessage.sender_type,
        messageType: agentMessage.message_type,
        content: agentMessage.content,
        metadata: agentMessage.metadata,
        createdAt: agentMessage.created_at
      }
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update chat session status
// @route   PUT /api/chat/sessions/:id
// @access  Private
const updateChatSession = async (req, res) => {
  try {
    const { status, metadata } = req.body;
    
    const chatSession = await ChatSession.findOne({
      where: {
        id: req.params.id,
        organization_id: req.user.organizationId
      }
    });
    
    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Update fields
    const updateData = {};
    if (status) {
      updateData.status = status;
      
      // If ending the session, set ended_at
      if (status === 'ended' || status === 'closed') {
        updateData.ended_at = new Date();
      }
    }
    
    if (metadata) {
      updateData.metadata = {
        ...chatSession.metadata,
        ...metadata
      };
    }
    
    // Update session
    await chatSession.update(updateData);

    // If ending the session, add system message
    if (status === 'ended' || status === 'closed') {
      await ChatMessage.create({
        chat_session_id: chatSession.id,
        sender_type: 'system',
        message_type: 'system',
        content: 'Chat session ended'
      });
    }

    res.json({
      id: chatSession.id,
      organizationId: chatSession.organization_id,
      agentId: chatSession.agent_id,
      visitorId: chatSession.visitor_id,
      status: chatSession.status,
      metadata: chatSession.metadata,
      createdAt: chatSession.created_at,
      updatedAt: chatSession.updated_at,
      endedAt: chatSession.ended_at
    });
  } catch (error) {
    console.error('Error updating chat session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Transition chat session to voice call
// @route   POST /api/chat/sessions/:id/voice
// @access  Private
const transitionToVoice = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    const chatSession = await ChatSession.findOne({
      where: {
        id: req.params.id,
        organization_id: req.user.organizationId
      },
      include: [{
        model: Agent,
        attributes: ['id', 'retellAgentId']
      }]
    });
    
    if (!chatSession) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Check if session is active
    if (chatSession.status !== 'active') {
      return res.status(400).json({ message: 'Chat session is not active' });
    }

    // Create call in Retell
    const retellResponse = await retellService.createPhoneCall(
      process.env.RETELL_PHONE_NUMBER || '+15555555555', // From number (your Retell number)
      phoneNumber, // To number (user's phone)
      chatSession.Agent.retellAgentId
    );

    // Create call in database
    const call = await Call.create({
      agentId: chatSession.agent_id,
      retellCallId: retellResponse.retellCallId,
      fromNumber: process.env.RETELL_PHONE_NUMBER || '+15555555555',
      toNumber: phoneNumber,
      direction: 'outbound',
      status: retellResponse.status,
      startedAt: new Date()
    });

    // Update chat session with call information
    await chatSession.update({
      metadata: {
        ...chatSession.metadata,
        callId: call.id,
        retellCallId: retellResponse.retellCallId
      }
    });

    // Add system message about voice transition
    await ChatMessage.create({
      chat_session_id: chatSession.id,
      sender_type: 'system',
      message_type: 'system',
      content: `Transitioning to voice call. Calling ${phoneNumber}...`
    });

    res.json({
      chatSessionId: chatSession.id,
      callId: call.id,
      retellCallId: retellResponse.retellCallId,
      status: retellResponse.status,
      phoneNumber
    });
  } catch (error) {
    console.error('Error transitioning to voice call:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createChatSession,
  getChatSessionById,
  getChatMessages,
  sendChatMessage,
  updateChatSession,
  transitionToVoice
};
