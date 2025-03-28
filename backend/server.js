const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  next();
});

// Import models and initialize associations
const models = require('./models/index');

// Import routes
const userRoutes = require('./routes/userRoutes');
const agentRoutes = require('./routes/agentRoutes');
const callRoutes = require('./routes/callRoutes');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/calls', callRoutes);

// Import and use resource routes separately to avoid potential ordering issues
try {
  const resourceRoutes = require('./routes/resourceRoutes');
  app.use('/api/resources', resourceRoutes);
  console.log('Resource routes registered successfully');
} catch (error) {
  console.error('Error registering resource routes:', error);
}

// Root route
app.get('/', (req, res) => {
  res.send('Retell AI Integration API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server with Sequelize connection
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('PostgreSQL database connection has been established successfully.');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();
