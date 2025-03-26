const axios = require('axios');

class RetellService {
  constructor() {
    if (!process.env.RETELL_API_KEY) {
      throw new Error('RETELL_API_KEY is not set in environment variables');
    }
    
    const baseURL = process.env.RETELL_API_BASE_URL || 'https://api.retellai.com';
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
      const url = `${this.api.defaults.baseURL}/create-agent`;
      console.log('Making Retell API request to:', url);
      
      // First, create a Retell LLM
      // Handle the constraint: Cannot set both model and s2s_model
      const llmRequestData = {
        temperature: llmConfig.temperature || 0,
        system_prompt: llmConfig.generalPrompt || '',
        high_priority: llmConfig.highPriority || false
      };
      
      // Prioritize s2s_model if both are provided
      if (llmConfig.s2sModel) {
        llmRequestData.s2s_model = llmConfig.s2sModel;
      } else if (llmConfig.model) {
        llmRequestData.model = llmConfig.model;
      } else {
        // Default to a standard model if neither is provided
        llmRequestData.model = 'gpt-4';
      }
      
      console.log('Creating Retell LLM with config:', llmRequestData);
      
      const llmResponse = await this.api.post('/create-retell-llm', llmRequestData);
      
      if (!llmResponse.data || !llmResponse.data.llm_id) {
        throw new Error('Invalid response structure from Retell API when creating LLM');
      }
      
      const llmId = llmResponse.data.llm_id;
      console.log('Created Retell LLM with ID:', llmId);
      
      // Now create the agent with the LLM ID
      const agentResponse = await this.api.post('/create-agent', {
        response_engine: {
          type: "retell-llm",
          llm_id: llmId
        },
        voice_id: voiceId
      });

      console.log('Retell API Response:', agentResponse.data);

      if (!agentResponse.data || !agentResponse.data.agent_id) {
        throw new Error('Invalid response structure from Retell API');
      }

      return {
        retellAgentId: agentResponse.data.agent_id,
        retellLlmId: llmId
      };
    } catch (error) {
      console.error('Retell API Error Details:', {
        url: `${this.api.defaults.baseURL}/create-agent`,
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
      const url = `${this.api.defaults.baseURL}/update-agent/${agentId}`;
      console.log('Making Retell API request to:', url);
      console.log('Updating Retell agent:', { agentId, voiceId, llmId });
      
      // Updated to match the RetellAI API documentation
      const updateData = {
        voice_id: voiceId
      };
      
      if (llmId) {
        updateData.response_engine = {
          type: "retell-llm",
          llm_id: llmId
        };
      }
      
      const response = await this.api.patch(`/update-agent/${agentId}`, updateData);

      console.log('Retell update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating Retell agent:', {
        url: `${this.api.defaults.baseURL}/update-agent/${agentId}`,
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
      const url = `${this.api.defaults.baseURL}/delete-agent/${agentId}`;
      console.log('Making Retell API request to:', url);
      console.log('Deleting Retell agent:', agentId);
      
      // Updated to match the RetellAI API documentation
      const response = await this.api.delete(`/delete-agent/${agentId}`);
      console.log('Retell delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting Retell agent:', {
        url: `${this.api.defaults.baseURL}/delete-agent/${agentId}`,
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
      const url = `${this.api.defaults.baseURL}/create-phone-call`;
      console.log('Making Retell API request to:', url);
      console.log('Creating phone call:', { fromNumber, toNumber, agentId });
      
      // Updated to match the RetellAI API documentation
      const response = await this.api.post('/create-phone-call', {
        from_number: fromNumber,
        to_number: toNumber,
        agent_id: agentId
      });

      console.log('Phone call response:', response.data);

      if (!response.data || !response.data.call_id) {
        throw new Error('Invalid response structure from Retell API');
      }

      return {
        retellCallId: response.data.call_id,
        status: response.data.call_status
      };
    } catch (error) {
      console.error('Error creating phone call:', {
        url: `${this.api.defaults.baseURL}/create-phone-call`,
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
      const url = `${this.api.defaults.baseURL}/get-call/${callId}`;
      console.log('Making Retell API request to:', url);
      console.log('Getting call status for:', callId);
      
      // Updated to match the RetellAI API documentation
      const response = await this.api.get(`/get-call/${callId}`);
      console.log('Call status response:', response.data);
      
      if (!response.data || !response.data.call_status) {
        throw new Error('Invalid response structure from Retell API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting call status:', {
        url: `${this.api.defaults.baseURL}/get-call/${callId}`,
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
