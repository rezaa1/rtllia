const axios = require('axios');
const ChatSession = require('../models/chat/ChatSession');
const ChatMessage = require('../models/chat/ChatMessage');
const Agent = require('../models/Agent');
const LLMConfiguration = require('../models/LLMConfiguration');
const retellService = require('./retellService');

class ChatService {
  constructor() {
    this.sessionContexts = new Map(); // In-memory cache for conversation contexts
  }

  /**
   * Get agent response for a chat message
   * @param {number} agentId - The agent ID
   * @param {number} sessionId - The chat session ID
   * @param {string} userMessage - The user's message
   * @returns {Promise<Object>} - The agent's response
   */
  async getAgentResponse(agentId, sessionId, userMessage) {
    try {
      // Get agent and LLM configuration
      const agent = await Agent.findByPk(agentId, {
        include: [{
          model: LLMConfiguration,
          as: 'llmConfig'
        }]
      });

      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }

      // Get conversation history
      const messages = await ChatMessage.findAll({
        where: { chat_session_id: sessionId },
        order: [['created_at', 'ASC']],
        limit: 20 // Limit to last 20 messages for context
      });

      // Format conversation history for the LLM
      const conversationHistory = messages.map(msg => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add user's new message
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Get LLM configuration
      const llmConfig = agent.llmConfig;
      const model = llmConfig.model || 'gpt-4';
      const temperature = llmConfig.temperature || 0.7;

      // Prepare system prompt
      const systemPrompt = llmConfig.generalPrompt || 
        'You are a helpful assistant. Respond concisely and accurately to the user\'s questions.';

      // Prepare the request to the LLM API
      const requestData = {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        temperature: temperature,
        max_tokens: 500
      };

      // Make request to OpenAI or other LLM provider
      // This is a simplified example - in production, you would use the appropriate API
      const response = await this.callLLMAPI(requestData);

      return {
        message: response.content,
        metadata: {
          model: model,
          tokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('Error getting agent response:', error);
      return {
        message: "I'm sorry, I encountered an error processing your request. Please try again later.",
        metadata: {
          error: error.message
        }
      };
    }
  }

  /**
   * Call LLM API to get response
   * @param {Object} requestData - The request data for the LLM API
   * @returns {Promise<Object>} - The LLM response
   */
  async callLLMAPI(requestData) {
    try {
      // This is a simplified example - in production, you would use the appropriate API client
      // For this implementation, we'll simulate a response
      
      // In a real implementation, you would make an API call like:
      // const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
      //   headers: {
      //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // return response.data.choices[0].message;

      // For now, simulate a response
      console.log('Simulating LLM API call with data:', JSON.stringify(requestData, null, 2));
      
      // Extract the last user message
      const lastUserMessage = requestData.messages.filter(m => m.role === 'user').pop();
      
      // Generate a simple response based on the user's message
      let responseContent = "I'm here to help! What can I assist you with today?";
      
      if (lastUserMessage) {
        if (lastUserMessage.content.toLowerCase().includes('hello') || 
            lastUserMessage.content.toLowerCase().includes('hi')) {
          responseContent = "Hello! How can I assist you today?";
        } else if (lastUserMessage.content.toLowerCase().includes('help')) {
          responseContent = "I'd be happy to help. Could you please provide more details about what you need assistance with?";
        } else if (lastUserMessage.content.toLowerCase().includes('thank')) {
          responseContent = "You're welcome! Is there anything else I can help you with?";
        } else if (lastUserMessage.content.toLowerCase().includes('bye')) {
          responseContent = "Goodbye! Feel free to reach out if you need anything else.";
        } else if (lastUserMessage.content.toLowerCase().includes('voice')) {
          responseContent = "Would you like to switch to a voice call? I can call you if you provide your phone number.";
        } else {
          responseContent = `I understand you're asking about "${lastUserMessage.content}". Let me help you with that. What specific information are you looking for?`;
        }
      }
      
      return {
        content: responseContent,
        usage: {
          total_tokens: 150
        }
      };
    } catch (error) {
      console.error('Error calling LLM API:', error);
      throw error;
    }
  }

  /**
   * Transition from chat to voice call
   * @param {number} sessionId - The chat session ID
   * @param {string} phoneNumber - The user's phone number
   * @returns {Promise<Object>} - The call details
   */
  async transitionToVoice(sessionId, phoneNumber) {
    try {
      // Get chat session
      const chatSession = await ChatSession.findByPk(sessionId, {
        include: [{
          model: Agent,
          attributes: ['id', 'retellAgentId']
        }]
      });
      
      if (!chatSession) {
        throw new Error(`Chat session with ID ${sessionId} not found`);
      }

      // Create call in Retell
      const retellResponse = await retellService.createPhoneCall(
        process.env.RETELL_PHONE_NUMBER || '+15555555555', // From number (your Retell number)
        phoneNumber, // To number (user's phone)
        chatSession.Agent.retellAgentId
      );

      return {
        retellCallId: retellResponse.retellCallId,
        status: retellResponse.status
      };
    } catch (error) {
      console.error('Error transitioning to voice call:', error);
      throw error;
    }
  }

  /**
   * Get chat session history
   * @param {number} sessionId - The chat session ID
   * @returns {Promise<Array>} - The chat session history
   */
  async getChatHistory(sessionId) {
    try {
      const messages = await ChatMessage.findAll({
        where: { chat_session_id: sessionId },
        order: [['created_at', 'ASC']]
      });

      return messages.map(message => ({
        id: message.id,
        sessionId: message.chat_session_id,
        senderType: message.sender_type,
        messageType: message.message_type,
        content: message.content,
        voiceUrl: message.voice_url,
        metadata: message.metadata,
        createdAt: message.created_at
      }));
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }
}

module.exports = new ChatService();
