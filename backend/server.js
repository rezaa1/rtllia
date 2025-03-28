const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');
const WebSocketServer = require('./services/webSocketService');
const widgetRoutes = require('./routes/widgetRoutes'); // Import the widget routes

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/organizations', require('./routes/organizationRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/calls', require('./routes/callRoutes'));
app.use('/api/white-label', require('./routes/whiteLabelRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/widgets', widgetRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer(server);

// Define port
const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
