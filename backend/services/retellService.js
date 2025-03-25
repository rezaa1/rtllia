const axios = require('axios');

class RetellService {
  constructor() {
    this.api = axios.create({
      baseURL: 'https://api.retellai.com/v1',
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createRetellAgent(voiceId, llmConfig) {
    try {
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

      return {
        retellAgentId: response.data.agent_id,
        retellLlmId: response.data.llm_id
      };
    } catch (error) {
      console.error('Error creating Retell agent:', error.response?.data || error.message);
      throw new Error('Failed to create Retell agent');
    }
  }

  async updateRetellAgent(agentId, voiceId, llmId) {
    try {
      await this.api.put(`/agents/${agentId}`, {
        voice_id: voiceId,
        llm_id: llmId
      });
    } catch (error) {
      console.error('Error updating Retell agent:', error.response?.data || error.message);
      throw new Error('Failed to update Retell agent');
    }
  }

  async deleteRetellAgent(agentId) {
    try {
      await this.api.delete(`/agents/${agentId}`);
    } catch (error) {
      console.error('Error deleting Retell agent:', error.response?.data || error.message);
      throw new Error('Failed to delete Retell agent');
    }
  }

  async createPhoneCall(fromNumber, toNumber, agentId) {
    try {
      const response = await this.api.post('/calls', {
        from_number: fromNumber,
        to_number: toNumber,
        agent_id: agentId
      });

      return {
        retellCallId: response.data.call_id,
        status: response.data.status
      };
    } catch (error) {
      console.error('Error creating phone call:', error.response?.data || error.message);
      throw new Error('Failed to create phone call');
    }
  }

  async getCallStatus(callId) {
    try {
      const response = await this.api.get(`/calls/${callId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting call status:', error.response?.data || error.message);
      throw new Error('Failed to get call status');
    }
  }
}

// Create a singleton instance
const retellService = new RetellService();

module.exports = retellService;