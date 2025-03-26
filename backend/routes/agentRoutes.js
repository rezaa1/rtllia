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

// Debug middleware for agent routes
router.use((req, res, next) => {
  console.log('Agent Route:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  next();
});

// All routes are protected
router.route('/')
  .post(protect, createAgent)
  .get(protect, getAgents);

router.route('/:id')
  .get(protect, getAgentById)
  .put(protect, updateAgent)
  .delete(protect, deleteAgent);
