const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const retellService = require('../services/retellService');

// Route to get available voices and models from RetellAI
router.get('/available-resources', protect, async (req, res) => {
  try {
    console.log('Fetching available voices and models from RetellAI');
    
    // Get the forceRefresh parameter from query string
    const forceRefresh = req.query.forceRefresh === 'true';
    
    // Fetch voices and models in parallel
    const [voices, llms, availableModels] = await Promise.all([
      retellService.listVoices(forceRefresh),
      retellService.listLLMs(forceRefresh),
      retellService.getAvailableModels()
    ]);
    
    console.log(`Retrieved ${voices.length} voices and ${llms.length} LLMs from RetellAI`);
    console.log(`Available models: ${availableModels.models.length}, s2s models: ${availableModels.s2sModels.length}`);
    
    // Return the combined data
    res.json({
      voices,
      llms,
      availableModels
    });
  } catch (error) {
    console.error('Error fetching available resources:', error);
    res.status(500).json({ 
      message: 'Failed to fetch available resources from RetellAI',
      error: error.message 
    });
  }
});

// Route to force refresh the cached resources
router.post('/refresh-resources', protect, async (req, res) => {
  try {
    console.log('Force refreshing cached resources from RetellAI');
    
    // Force refresh voices and models
    const [voices, llms, availableModels] = await Promise.all([
      retellService.listVoices(true),
      retellService.listLLMs(true),
      retellService.getAvailableModels()
    ]);
    
    console.log(`Refreshed ${voices.length} voices and ${llms.length} LLMs from RetellAI`);
    
    // Return the refreshed data
    res.json({
      success: true,
      message: 'Resources refreshed successfully',
      voices,
      llms,
      availableModels
    });
  } catch (error) {
    console.error('Error refreshing resources:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to refresh resources from RetellAI',
      error: error.message 
    });
  }
});

// Route to check voice-model compatibility
router.post('/check-compatibility', protect, async (req, res) => {
  try {
    const { voiceId, s2sModel } = req.body;
    
    if (!voiceId || !s2sModel) {
      return res.status(400).json({
        success: false,
        message: 'Voice ID and s2s_model are required'
      });
    }
    
    console.log(`Checking compatibility between voice ${voiceId} and s2s model ${s2sModel}`);
    
    const result = await retellService.checkVoiceModelCompatibility(voiceId, s2sModel);
    
    res.json({
      success: true,
      compatible: result.compatible,
      voice: result.voice
    });
  } catch (error) {
    console.error('Compatibility check failed:', error);
    res.status(400).json({
      success: false,
      compatible: false,
      message: error.message
    });
  }
});

module.exports = router;
