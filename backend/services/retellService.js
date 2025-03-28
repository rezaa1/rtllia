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
      timeout: 15000 // Increased timeout to 15 seconds
    });
    
    // Default voices and models to use as fallback
    this.defaultVoices = [
      {
        voice_id: "11labs-Rachel",
        voice_name: "Rachel",
        provider: "elevenlabs",
        gender: "female",
        accent: "American",
        age: "adult"
      },
      {
        voice_id: "11labs-Domi",
        voice_name: "Domi",
        provider: "elevenlabs",
        gender: "female",
        accent: "American",
        age: "adult"
      },
      {
        voice_id: "11labs-Adam",
        voice_name: "Adam",
        provider: "elevenlabs",
        gender: "male",
        accent: "American",
        age: "adult"
      },
      {
        voice_id: "11labs-Antoni",
        voice_name: "Antoni",
        provider: "elevenlabs",
        gender: "male",
        accent: "American",
        age: "adult"
      },
      {
        voice_id: "deepgram-nova",
        voice_name: "Nova",
        provider: "deepgram",
        gender: "female",
        accent: "American",
        age: "adult"
      }
    ];
    
    this.defaultLLMs = [
      {
        model: "gpt-4",
        s2s_model: null
      },
      {
        model: null,
        s2s_model: "gpt-4o-realtime"
      },
      {
        model: "claude-3-opus-20240229",
        s2s_model: null
      }
    ];
    
    // Cache for voices and LLMs
    this.voicesCache = null;
    this.llmsCache = null;
    this.lastVoicesFetch = 0;
    this.lastLLMsFetch = 0;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache TTL
  }

  async listVoices(forceRefresh = false) {
    try {
      const now = Date.now();
      
      // Return cached data if available and not expired
      if (!forceRefresh && this.voicesCache && (now - this.lastVoicesFetch < this.cacheTTL)) {
        console.log('Using cached voices data');
        return this.voicesCache;
      }
      
      console.log('Fetching available voices from RetellAI');
      
      // Make up to 3 attempts to fetch voices
      let attempts = 0;
      let error;
      
      while (attempts < 3) {
        try {
          const response = await this.api.get('/list-voices');
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log(`Retrieved ${response.data.length} voices from RetellAI`);
            
            // Update cache
            this.voicesCache = response.data;
            this.lastVoicesFetch = now;
            
            return response.data;
          } else {
            console.warn('RetellAI returned empty or invalid voices data, retrying...');
            attempts++;
          }
        } catch (err) {
          console.error(`Attempt ${attempts + 1} failed:`, err.message);
          error = err;
          attempts++;
          
          // Wait before retrying
          if (attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // If we get here, all attempts failed
      console.error('All attempts to fetch voices failed, using default voices');
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Use default voices as fallback
      return this.defaultVoices;
    } catch (error) {
      console.error('Error fetching voices from RetellAI:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Use default voices as fallback
      console.log('Using default voices as fallback');
      return this.defaultVoices;
    }
  }

  async listLLMs(forceRefresh = false) {
    try {
      const now = Date.now();
      
      // Return cached data if available and not expired
      if (!forceRefresh && this.llmsCache && (now - this.lastLLMsFetch < this.cacheTTL)) {
        console.log('Using cached LLMs data');
        return this.llmsCache;
      }
      
      console.log('Fetching available LLMs from RetellAI');
      
      // Make up to 3 attempts to fetch LLMs
      let attempts = 0;
      let error;
      
      while (attempts < 3) {
        try {
          const response = await this.api.get('/list-retell-llms');
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log(`Retrieved ${response.data.length} LLMs from RetellAI`);
            
            // Extract model information for easier use in frontend
            const processedLLMs = response.data.map(llm => ({
              llm_id: llm.llm_id,
              model: llm.model,
              s2s_model: llm.s2s_model,
              model_temperature: llm.model_temperature,
              model_high_priority: llm.model_high_priority
            }));
            
            // Update cache
            this.llmsCache = processedLLMs;
            this.lastLLMsFetch = now;
            
            return processedLLMs;
          } else {
            console.warn('RetellAI returned empty or invalid LLMs data, retrying...');
            attempts++;
          }
        } catch (err) {
          console.error(`Attempt ${attempts + 1} failed:`, err.message);
          error = err;
          attempts++;
          
          // Wait before retrying
          if (attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // If we get here, all attempts failed
      console.error('All attempts to fetch LLMs failed, using default LLMs');
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Use default LLMs as fallback
      return this.defaultLLMs;
    } catch (error) {
      console.error('Error fetching LLMs from RetellAI:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Use default LLMs as fallback
      console.log('Using default LLMs as fallback');
      return this.defaultLLMs;
    }
  }

  async getAvailableModels() {
    try {
      const llms = await this.listLLMs();
      
      // Extract unique models and s2s_models
      const models = new Set();
      const s2sModels = new Set();
      
      llms.forEach(llm => {
        if (llm.model) models.add(llm.model);
        if (llm.s2s_model) s2sModels.add(llm.s2s_model);
      });
      
      // If no models were found, add defaults
      if (models.size === 0) {
        models.add('gpt-4');
        models.add('claude-3-opus-20240229');
      }
      
      // If no s2s_models were found, add defaults
      if (s2sModels.size === 0) {
        s2sModels.add('gpt-4o-realtime');
      }
      
      return {
        models: Array.from(models),
        s2sModels: Array.from(s2sModels)
      };
    } catch (error) {
      console.error('Error getting available models:', error);
      
      // Return default models as fallback
      return {
        models: ['gpt-4', 'claude-3-opus-20240229'],
        s2sModels: ['gpt-4o-realtime']
      };
    }
  }

  async checkVoiceModelCompatibility(voiceId, s2sModel) {
    try {
      // First, get all available voices
      const voices = await this.listVoices();
      const voice = voices.find(v => v.voice_id === voiceId);
      
      if (!voice) {
        throw new Error(`Voice ${voiceId} not found. Please choose from available voices.`);
      }
      
      // Known incompatibilities based on error messages and provider
      const incompatiblePairs = [
        { voiceId: '11labs-Adrian', s2sModel: 'gpt-4o-realtime' }
      ];
      
      // Provider-based incompatibilities
      const providerIncompatibilities = [
        { provider: 'elevenlabs', s2sModel: 'gpt-4o-realtime', incompatible: true }
      ];
      
      // Check for specific voice-model incompatibility
      const isSpecificIncompatible = incompatiblePairs.some(pair => 
        pair.voiceId === voiceId && pair.s2sModel === s2sModel
      );
      
      // Check for provider-based incompatibility
      const isProviderIncompatible = providerIncompatibilities.some(pair => 
        pair.provider === voice.provider && 
        pair.s2sModel === s2sModel && 
        pair.incompatible
      );
      
      if (isSpecificIncompatible || isProviderIncompatible) {
        throw new Error(`Voice ${voiceId} (provider: ${voice.provider}) is not compatible with s2s model ${s2sModel}`);
      }
      
      return { compatible: true, voice };
    } catch (error) {
      console.error('Voice-model compatibility check failed:', error.message);
      throw error;
    }
  }

  async createRetellAgent(voiceId, llmConfig, agentName) {
    try {
      const url = `${this.api.defaults.baseURL}/create-agent`;
      console.log('Making Retell API request to:', url);
      
      // Check voice and model compatibility if s2sModel is provided
      if (llmConfig.s2sModel) {
        try {
          await this.checkVoiceModelCompatibility(voiceId, llmConfig.s2sModel);
          console.log(`Voice ${voiceId} is compatible with s2s model ${llmConfig.s2sModel}`);
        } catch (compatError) {
          console.error('Compatibility check failed:', compatError.message);
          throw compatError;
        }
      }
      
      // First, create a Retell LLM
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
        llmRequestData.model = 'gpt-4'; // Default model
      }
      
      console.log('Creating Retell LLM with config:', llmRequestData);
      
      const llmResponse = await this.api.post('/create-retell-llm', llmRequestData);
      
      if (!llmResponse.data || !llmResponse.data.llm_id) {
        throw new Error('Invalid response structure from Retell API when creating LLM');
      }
      
      const llmId = llmResponse.data.llm_id;
      console.log('Created Retell LLM with ID:', llmId);
      
      // Now create the agent with the LLM ID and agent name
      const agentResponse = await this.api.post('/create-agent', {
        response_engine: {
          type: "retell-llm",
          llm_id: llmId
        },
        voice_id: voiceId,
        name: agentName // Pass the agent name here
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
  async getAgentById(agentId) {
    try {
      const url = `${this.api.defaults.baseURL}/get-agent/${agentId}`;
      console.log('Making Retell API request to:', url);
      
      const response = await this.api.get(`/get-agent/${agentId}`);
      console.log('Agent response:', response.data);
      
      if (!response.data || !response.data.agent_id) {
        throw new Error('Invalid response structure from Retell API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting agent by ID:', {
        url: `${this.api.defaults.baseURL}/get-agent/${agentId}`,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Retell API key');
      } else if (error.response?.status === 404) {
        throw new Error('Agent not found');
      } else {
        throw new Error(`Failed to get agent: ${error.response?.data?.message || error.message}`);
      }
    }
  }

}

// Create a singleton instance
const retellService = new RetellService();

module.exports = retellService;
