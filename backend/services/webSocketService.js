const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const ChatSession = require('../models/chat/ChatSession');
const ChatMessage = require('../models/chat/ChatMessage');
const chatService = require('./chatService');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.sessions = new Map(); // Map of sessionId -> Set of connected clients
    this.initialize();
  }

  initialize() {
    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket connection established');
      
      // Parse URL to get session ID and token
      const url = new URL(req.url, 'http://localhost');
      const sessionId = url.searchParams.get('sessionId');
      const token = url.searchParams.get('token');
      
      // Store client information
      ws.sessionId = sessionId;
      ws.isAlive = true;
      
      // Authenticate the connection
      this.authenticateConnection(ws, token, sessionId)
        .then(authenticated => {
          if (!authenticated) {
            ws.close(4001, 'Authentication failed');
            return;
          }
          
          // Add client to session map
          if (!this.sessions.has(sessionId)) {
            this.sessions.set(sessionId, new Set());
          }
          this.sessions.get(sessionId).add(ws);
          
          // Send connection confirmation
          this.sendToClient(ws, {
            type: 'connection:established',
            sessionId,
            timestamp: new Date().toISOString()
          });
          
          // Handle messages
          ws.on('message', (message) => {
            this.handleMessage(ws, message);
          });
          
          // Handle close
          ws.on('close', () => {
            this.handleClose(ws);
          });
          
          // Handle pings to keep connection alive
          ws.on('pong', () => {
            ws.isAlive = true;
          });
        })
        .catch(error => {
          console.error('Authentication error:', error);
          ws.close(4002, 'Authentication error');
        });
    });
    
    // Set up ping interval to keep connections alive
    this.pingInterval = setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
    
    // Clean up on server close
    this.wss.on('close', () => {
      clearInterval(this.pingInterval);
    });
  }
  
  /**
   * Authenticate WebSocket connection
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} token - JWT token
   * @param {string} sessionId - Chat session ID
   * @returns {Promise<boolean>} - Whether authentication was successful
   */
  async authenticateConnection(ws, token, sessionId) {
    try {
      // If no token or session ID, fail authentication
      if (!token || !sessionId) {
        return false;
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Store user information
      ws.userId = decoded.id;
      ws.organizationId = decoded.organizationId;
      
      // Check if session exists and belongs to organization
      const session = await ChatSession.findOne({
        where: {
          id: sessionId,
          organization_id: decoded.organizationId
        }
      });
      
      return !!session;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }
  
  /**
   * Handle incoming WebSocket message
   * @param {WebSocket} ws - WebSocket connection
   * @param {string} message - Raw message data
   */
  async handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'message:send':
          await this.handleChatMessage(ws, data);
          break;
        case 'typing:start':
          this.broadcastToSession(ws.sessionId, {
            type: 'typing:start',
            senderId: data.senderId,
            timestamp: new Date().toISOString()
          }, ws);
          break;
        case 'typing:stop':
          this.broadcastToSession(ws.sessionId, {
            type: 'typing:stop',
            senderId: data.senderId,
            timestamp: new Date().toISOString()
          }, ws);
          break;
        case 'mode:change':
          await this.handleModeChange(ws, data);
          break;
        case 'ping':
          this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendToClient(ws, {
        type: 'error',
        error: 'Failed to process message',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Handle chat message
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} data - Message data
   */
  async handleChatMessage(ws, data) {
    try {
      // Validate session
      const session = await ChatSession.findOne({
        where: {
          id: ws.sessionId,
          organization_id: ws.organizationId
        }
      });
      
      if (!session) {
        return this.sendToClient(ws, {
          type: 'error',
          error: 'Session not found',
          timestamp: new Date().toISOString()
        });
      }
      
      // Create user message
      const userMessage = await ChatMessage.create({
        chat_session_id: ws.sessionId,
        sender_type: 'user',
        message_type: data.messageType || 'text',
        content: data.content,
        metadata: data.metadata || {}
      });
      
      // Broadcast user message to all clients in session
      this.broadcastToSession(ws.sessionId, {
        type: 'message:received',
        message: {
          id: userMessage.id,
          sessionId: userMessage.chat_session_id,
          senderType: userMessage.sender_type,
          messageType: userMessage.message_type,
          content: userMessage.content,
          metadata: userMessage.metadata,
          createdAt: userMessage.created_at
        },
        timestamp: new Date().toISOString()
      });
      
      // Get agent response
      this.broadcastToSession(ws.sessionId, {
        type: 'typing:start',
        senderId: 'agent',
        timestamp: new Date().toISOString()
      });
      
      const agentResponse = await chatService.getAgentResponse(
        session.agent_id,
        ws.sessionId,
        data.content
      );
      
      // Create agent message
      const agentMessage = await ChatMessage.create({
        chat_session_id: ws.sessionId,
        sender_type: 'agent',
        message_type: 'text',
        content: agentResponse.message,
        metadata: agentResponse.metadata || {}
      });
      
      // Broadcast agent message to all clients in session
      this.broadcastToSession(ws.sessionId, {
        type: 'typing:stop',
        senderId: 'agent',
        timestamp: new Date().toISOString()
      });
      
      this.broadcastToSession(ws.sessionId, {
        type: 'message:received',
        message: {
          id: agentMessage.id,
          sessionId: agentMessage.chat_session_id,
          senderType: agentMessage.sender_type,
          messageType: agentMessage.message_type,
          content: agentMessage.content,
          metadata: agentMessage.metadata,
          createdAt: agentMessage.created_at
        },
        timestamp: new Date().toISOString()
      });
      
      // Update session last activity
      await session.update({
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error handling chat message:', error);
      this.sendToClient(ws, {
        type: 'error',
        error: 'Failed to process message',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Handle mode change request (chat to voice or vice versa)
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} data - Mode change data
   */
  async handleModeChange(ws, data) {
    try {
      if (data.mode === 'voice' && data.phoneNumber) {
        // Transition to voice call
        const callDetails = await chatService.transitionToVoice(
          ws.sessionId,
          data.phoneNumber
        );
        
        // Create system message about voice transition
        const systemMessage = await ChatMessage.create({
          chat_session_id: ws.sessionId,
          sender_type: 'system',
          message_type: 'system',
          content: `Transitioning to voice call. Calling ${data.phoneNumber}...`,
          metadata: {
            callId: callDetails.retellCallId,
            status: callDetails.status
          }
        });
        
        // Broadcast mode change to all clients in session
        this.broadcastToSession(ws.sessionId, {
          type: 'mode:changed',
          mode: 'voice',
          callDetails: {
            retellCallId: callDetails.retellCallId,
            status: callDetails.status,
            phoneNumber: data.phoneNumber
          },
          message: {
            id: systemMessage.id,
            sessionId: systemMessage.chat_session_id,
            senderType: systemMessage.sender_type,
            messageType: systemMessage.message_type,
            content: systemMessage.content,
            metadata: systemMessage.metadata,
            createdAt: systemMessage.created_at
          },
          timestamp: new Date().toISOString()
        });
      } else {
        this.sendToClient(ws, {
          type: 'error',
          error: 'Invalid mode change request',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error handling mode change:', error);
      this.sendToClient(ws, {
        type: 'error',
        error: 'Failed to change mode',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Handle WebSocket connection close
   * @param {WebSocket} ws - WebSocket connection
   */
  handleClose(ws) {
    console.log(`WebSocket connection closed for session ${ws.sessionId}`);
    
    // Remove client from session map
    if (this.sessions.has(ws.sessionId)) {
      this.sessions.get(ws.sessionId).delete(ws);
      
      // If no more clients in session, remove session from map
      if (this.sessions.get(ws.sessionId).size === 0) {
        this.sessions.delete(ws.sessionId);
      }
    }
  }
  
  /**
   * Send message to a specific client
   * @param {WebSocket} client - WebSocket client
   * @param {Object} data - Message data
   */
  sendToClient(client, data) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
  
  /**
   * Broadcast message to all clients in a session
   * @param {string} sessionId - Chat session ID
   * @param {Object} data - Message data
   * @param {WebSocket} [exclude] - Client to exclude from broadcast
   */
  broadcastToSession(sessionId, data, exclude = null) {
    if (!this.sessions.has(sessionId)) {
      return;
    }
    
    this.sessions.get(sessionId).forEach(client => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = WebSocketServer;
