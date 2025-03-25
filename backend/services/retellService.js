const axios = require('axios');

class RetellService {
  constructor() {
    if (!process.env.RETELL_API_KEY) {
      console.error('RETELL_API_KEY is not set in environment variables');
    }
    
    this.api = axios.create({
      baseURL: 'https://api.retell.cc/api',  // Updated API endpoint
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createRetellAgent(voiceId, llmConfig) {
    try {
      console.log('Creating Retell agent with config:', { voiceId, llmConfig });
      
      const response = await this.api.post('/agents', {
        voice_id: voiceId,
        llm_config: {
          model: llmConfig.model,
          s2s_model: llmConfig.s2sModel,
          temperature: llmConfig.temperature,
          high_priority: llmConfig.highPriority,
          general_prompt: llmConfig.generalPrompt
        }
      });

      console.log('Retell agent created successfully:', response.data);

      return {
        retellAgentId: response.data.agent_id,
        retellLlmId: response.data.llm_id
      };
    } catch (error) {
      console.error('Error creating Retell agent:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid or missing Retell API key');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid request parameters');
      } else {
        throw new Error('Failed to create Retell agent: ' + (error.response?.data?.message || error.message));
      }
    }
  }

  async updateRetellAgent(agentId, voiceId, llmId) {
    try {
      console.log('Updating Retell agent:', { agentId, voiceId, llmId });
      
      const response = await this.api.put(`/agents/${agentId}`, {
        voice_id: voiceId,
        llm_id: llmId
      });

      console.log('Retell agent updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating Retell agent:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid or missing Retell API key');
      } else if (error.response?.status === 404) {
        throw new Error('Agent not found');
      } else {
        throw new Error('Failed to update Retell agent: ' + (error.response?.data?.message || error.message));
      }
    }
  }

  async deleteRetellAgent(agentId) {
    try {
      console.log('Deleting Retell agent:', agentId);
      
      const response = await this.api.delete(`/agents/${agentId}`);
      console.log('Retell agent deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting Retell agent:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid or missing Retell API key');
      } else if (error.response?.status === 404) {
        throw new Error('Agent not found');
      } else {
        throw new Error('Failed to delete Retell agent: ' + (error.response?.data?.message || error.message));
      }
    }
  }

  async createPhoneCall(fromNumber, toNumber, agentId) {
    try {
      console.log('Creating phone call:', { fromNumber, toNumber, agentId });
      
      const response = await this.api.post('/calls', {
        from_number: fromNumber,
        to_number: toNumber,
        agent_id: agentId
      });

      console.log('Phone call created successfully:', response.data);

      return {
        retellCallId: response.data.call_id,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error creating phone call:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid or missing Retell API key');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid request parameters');
      } else {
        throw new Error('Failed to create phone call: ' + (error.response?.data?.message || error.message));
      }
    }
  }

  async getCallStatus(callId) {
    try {
      console.log('Getting call status for:', callId);
      
      const response = await this.api.get(`/calls/${callId}`);
      console.log('Call status retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting call status:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid or missing Retell API key');
      } else if (error.response?.status === 404) {
        throw new Error('Call not found');
      } else {
        throw new Error('Failed to get call status: ' + (error.response?.data?.message || error.message));
      }
    }
  }
}

// Create a singleton instance
const retellService = new RetellService();

module.exports = retellService;