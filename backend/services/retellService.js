const axios = require('axios');

class RetellService {
  constructor() {
    if (!process.env.RETELL_API_KEY) {
      throw new Error('RETELL_API_KEY is not set in environment variables');
    }
    
    const baseURL = process.env.RETELL_API_BASE_URL || 'https://api.retell.cc/v1';
    console.log('Initializing Retell API Service with base URL:', baseURL);
    
    this.api = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
  }

  async createRetellAgent(voiceId, llmConfig) {
    try {
      const url = `${this.api.defaults.baseURL}/agents`;
      console.log('Making Retell API request to:', url);
      console.log('Creating Retell agent with config:', {
        voiceId,
        llmConfig: {
          ...llmConfig,
          model: llmConfig.model,
          temperature: llmConfig.temperature,
          high_priority: llmConfig.highPriority
        }
      });
      
      const response = await this.api.post('/agents', {
        voice_id: voiceId,
        llm_config: {
          model: llmConfig.model,
          temperature: llmConfig.temperature || 0,
          high_priority: llmConfig.highPriority || false,
          system_prompt: llmConfig.generalPrompt || '',
          // Add s2s_model only if provided
          ...(llmConfig.s2sModel && { s2s_model: llmConfig.s2sModel })
        }
      });

      console.log('Retell API Response:', response.data);

      if (!response.data || !response.data.id || !response.data.llm_config_id) {
        throw new Error('Invalid response structure from Retell API');
      }

      return {
        retellAgentId: response.data.id,
        retellLlmId: response.data.llm_config_id
      };
    } catch (error) {
      console.error('Retell API Error Details:', {
        url: `${this.api.defaults.baseURL}/agents`,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: {
            ...error.config?.headers,
            Authorization: '[REDACTED]'
          }
        }
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Retell API key');
      } else if (error.response?.status === 400) {
        throw new Error(`Invalid request: ${error.response.data.message || 'Bad request'}`);
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (!error.response) {
        throw new Error('Network error: Unable to reach Retell API. Please check your API key and network connection.');
      } else {
        throw new Error(`Retell API error: ${error.response.data.message || error.message}`);
      }
    }
  }

  async updateRetellAgent(agentId, voiceId, llmId) {
    try {
      const url = `${this.api.defaults.baseURL}/agents/${agentId}`;
      console.log('Making Retell API request to:', url);
      console.log('Updating Retell agent:', { agentId, voiceId, llmId });
      
      const response = await this.api.put(`/agents/${agentId}`, {
        voice_id: voiceId,
        ...(llmId && { llm_config_id: llmId })
      });

      console.log('Retell update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating Retell agent:', {
        url: `${this.api.defaults.baseURL}/agents/${agentId}`,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Retell API key');
      } else if (error.response?.status === 404) {
        throw new Error('Agent not found in Retell');
      } else {
        throw new Error(`Failed to update Retell agent: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  async deleteRetellAgent(agentId) {
    try {
      const url = `${this.api.defaults.baseURL}/agents/${agentId}`;
      console.log('Making Retell API request to:', url);
      console.log('Deleting Retell agent:', agentId);
      
      const response = await this.api.delete(`/agents/${agentId}`);
      console.log('Retell delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting Retell agent:', {
        url: `${this.api.defaults.baseURL}/agents/${agentId}`,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Retell API key');
      } else if (error.response?.status === 404) {
        throw new Error('Agent not found in Retell');
      } else {
        throw new Error(`Failed to delete Retell agent: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  async createPhoneCall(fromNumber, toNumber, agentId) {
    try {
      const url = `${this.api.defaults.baseURL}/calls`;
      console.log('Making Retell API request to:', url);
      console.log('Creating phone call:', { fromNumber, toNumber, agentId });
      
      const response = await this.api.post('/calls', {
        from_number: fromNumber,
        to_number: toNumber,
        agent_id: agentId
      });

      console.log('Phone call response:', response.data);

      if (!response.data || !response.data.id) {
        throw new Error('Invalid response structure from Retell API');
      }

      return {
        retellCallId: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error creating phone call:', {
        url: `${this.api.defaults.baseURL}/calls`,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Retell API key');
      } else if (error.response?.status === 400) {
        throw new Error(`Invalid request: ${error.response.data.message || 'Bad request'}`);
      } else {
        throw new Error(`Failed to create phone call: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  async getCallStatus(callId) {
    try {
      const url = `${this.api.defaults.baseURL}/calls/${callId}`;
      console.log('Making Retell API request to:', url);
      console.log('Getting call status for:', callId);
      
      const response = await this.api.get(`/calls/${callId}`);
      console.log('Call status response:', response.data);
      
      if (!response.data || !response.data.status) {
        throw new Error('Invalid response structure from Retell API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting call status:', {
        url: `${this.api.defaults.baseURL}/calls/${callId}`,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Retell API key');
      } else if (error.response?.status === 404) {
        throw new Error('Call not found');
      } else {
        throw new Error(`Failed to get call status: ${error.response?.data?.message || error.message}`);
      }
    }
  }
}

// Create a singleton instance
const retellService = new RetellService();

module.exports = retellService;