const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const retellService = require('../services/retellService');

// Route to get available voices and models from RetellAI
router.get('/available-resources', protect, async (req, res) => {
  try {
    console.log('Fetching available voices and models from RetellAI');
    
    // Fetch voices and models in parallel
    const [voices, llms] = await Promise.all([
      retellService.listVoices(),
      retellService.listLLMs()
    ]);
    
    console.log(`Retrieved ${voices.length} voices and ${llms.length} LLMs from RetellAI`);
    
    // Return the combined data
    res.json({
      voices,
      llms
    });
  } catch (error) {
    console.error('Error fetching available resources:', error);
    res.status(500).json({ 
      message: 'Failed to fetch available resources from RetellAI',
      error: error.message 
    });
  }
});

module.exports = router;
