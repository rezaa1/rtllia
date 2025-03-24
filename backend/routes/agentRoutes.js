const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');

// All routes are protected
router.route('/')
  .post(protect, createAgent)
  .get(protect, getAgents);

router.route('/:id')
  .get(protect, getAgentById)
  .put(protect, updateAgent)
  .delete(protect, deleteAgent);

module.exports = router;
