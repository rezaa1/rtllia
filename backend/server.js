const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const agentRoutes = require('./routes/agentRoutes');
const callRoutes = require('./routes/callRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/calls', callRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Retell AI Integration API is running...');
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
