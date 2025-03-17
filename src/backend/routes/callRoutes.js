const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createCall,
  getCalls,
  getCallById,
  updateCallStatus
} = require('../controllers/callController');

// All routes are protected
router.route('/')
  .post(protect, createCall)
  .get(protect, getCalls);

router.route('/:id')
  .get(protect, getCallById)
  .put(protect, updateCallStatus);

module.exports = router;
