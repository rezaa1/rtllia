// Test script for chat/voice widget functionality
// This script simulates API responses for testing purposes

// Mock API responses
const mockResponses = {
  // Authentication response
  '/embed/auth': {
    token: 'mock_jwt_token_for_testing',
    agentId: 1,
    themeColor: '#0088FF',
    headerText: 'Chat with us'
  },
  
  // Widget configuration response
  '/embed/config/1': {
    id: 1,
    agentId: 1,
    themeColor: '#0088FF',
    headerText: 'Chat with us',
    welcomeMessage: 'Hello! How can I help you today?'
  },
  
  // Chat session creation response
  '/api/chat/sessions': {
    id: 'mock-session-123',
    organizationId: 1,
    agentId: 1,
    visitorId: 'visitor-123',
    status: 'active',
    createdAt: new Date().toISOString()
  },
  
  // Chat message response
  '/api/chat/sessions/mock-session-123/messages': [
    {
      id: 'msg-1',
      sessionId: 'mock-session-123',
      senderType: 'agent',
      messageType: 'text',
      content: 'Hello! How can I help you today?',
      createdAt: new Date().toISOString()
    }
  ]
};

// Mock WebSocket events
const mockWebSocketEvents = [
  {
    type: 'connection:established',
    sessionId: 'mock-session-123',
    timestamp: new Date().toISOString()
  },
  {
    type: 'message:received',
    message: {
      id: 'msg-2',
      sessionId: 'mock-session-123',
      senderType: 'user',
      messageType: 'text',
      content: 'Hello, I have a question',
      createdAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  },
  {
    type: 'typing:start',
    senderId: 'agent',
    timestamp: new Date().toISOString()
  },
  {
    type: 'typing:stop',
    senderId: 'agent',
    timestamp: new Date(Date.now() + 2000).toISOString()
  },
  {
    type: 'message:received',
    message: {
      id: 'msg-3',
      sessionId: 'mock-session-123',
      senderType: 'agent',
      messageType: 'text',
      content: "I'm happy to help! What would you like to know?",
      createdAt: new Date(Date.now() + 2000).toISOString()
    },
    timestamp: new Date(Date.now() + 2000).toISOString()
  }
];

// Intercept fetch requests for testing
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  console.log('Intercepted fetch request:', url, options);
  
  // Extract the path from the URL
  let path = url;
  if (url.startsWith('http')) {
    const urlObj = new URL(url);
    path = urlObj.pathname;
  }
  
  // Check if we have a mock response for this path
  if (mockResponses[path]) {
    console.log('Returning mock response for:', path);
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponses[path])
    });
  }
  
  // For POST requests to chat sessions
  if (path === '/api/chat/sessions/mock-session-123/messages' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    console.log('Received message:', body);
    
    // Simulate agent response
    setTimeout(() => {
      if (window.mockWebSocketInstance) {
        window.mockWebSocketInstance.simulateMessage({
          type: 'typing:start',
          senderId: 'agent',
          timestamp: new Date().toISOString()
        });
        
        setTimeout(() => {
          window.mockWebSocketInstance.simulateMessage({
            type: 'typing:stop',
            senderId: 'agent',
            timestamp: new Date().toISOString()
          });
          
          window.mockWebSocketInstance.simulateMessage({
            type: 'message:received',
            message: {
              id: 'msg-' + Math.random().toString(36).substring(2, 9),
              sessionId: 'mock-session-123',
              senderType: 'agent',
              messageType: 'text',
              content: generateResponse(body.content),
              createdAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          });
        }, 2000);
      }
    }, 500);
    
    return Promise.resolve({
      ok: true,
      status: 201,
      json: () => Promise.resolve({
        id: 'msg-' + Math.random().toString(36).substring(2, 9),
        sessionId: 'mock-session-123',
        senderType: 'user',
        messageType: 'text',
        content: body.content,
        createdAt: new Date().toISOString()
      })
    });
  }
  
  // Fall back to original fetch for other requests
  return originalFetch(url, options);
};

// Mock WebSocket for testing
class MockWebSocket {
  constructor(url) {
    console.log('Creating mock WebSocket connection to:', url);
    this.url = url;
    this.readyState = 0; // CONNECTING
    
    // Store instance for external access
    window.mockWebSocketInstance = this;
    
    // Simulate connection established
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen({ target: this });
      }
      
      // Simulate initial messages
      mockWebSocketEvents.forEach((event, index) => {
        setTimeout(() => {
          this.simulateMessage(event);
        }, 1000 + index * 2000);
      });
    }, 500);
  }
  
  send(data) {
    console.log('WebSocket message sent:', data);
    
    try {
      const parsedData = JSON.parse(data);
      
      // Handle message sending
      if (parsedData.type === 'message:send') {
        setTimeout(() => {
          // Echo back the message as received
          this.simulateMessage({
            type: 'message:received',
            message: {
              id: 'msg-' + Math.random().toString(36).substring(2, 9),
              sessionId: 'mock-session-123',
              senderType: 'user',
              messageType: parsedData.messageType || 'text',
              content: parsedData.content,
              createdAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          });
          
          // Simulate agent typing
          setTimeout(() => {
            this.simulateMessage({
              type: 'typing:start',
              senderId: 'agent',
              timestamp: new Date().toISOString()
            });
            
            // Simulate agent response
            setTimeout(() => {
              this.simulateMessage({
                type: 'typing:stop',
                senderId: 'agent',
                timestamp: new Date().toISOString()
              });
              
              this.simulateMessage({
                type: 'message:received',
                message: {
                  id: 'msg-' + Math.random().toString(36).substring(2, 9),
                  sessionId: 'mock-session-123',
                  senderType: 'agent',
                  messageType: 'text',
                  content: generateResponse(parsedData.content),
                  createdAt: new Date().toISOString()
                },
                timestamp: new Date().toISOString()
              });
            }, 2000);
          }, 500);
        }, 300);
      }
      
      // Handle mode change
      if (parsedData.type === 'mode:change' && parsedData.mode === 'voice') {
        setTimeout(() => {
          this.simulateMessage({
            type: 'mode:changed',
            mode: 'voice',
            callDetails: {
              retellCallId: 'mock-call-' + Math.random().toString(36).substring(2, 9),
              status: 'connecting',
              phoneNumber: parsedData.phoneNumber
            },
            message: {
              id: 'msg-' + Math.random().toString(36).substring(2, 9),
              sessionId: 'mock-session-123',
              senderType: 'system',
              messageType: 'system',
              content: `Transitioning to voice call. Calling ${parsedData.phoneNumber}...`,
              createdAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }
  
  close() {
    console.log('WebSocket connection closed');
    this.readyState = 3; // CLOSED
    if (this.onclose) {
      this.onclose({ target: this, code: 1000, reason: 'Normal closure' });
    }
  }
  
  simulateMessage(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

// Replace WebSocket with mock for testing
window.WebSocket = MockWebSocket;

// Generate simple responses based on user input
function generateResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! How can I assist you today?";
  } else if (message.includes('help')) {
    return "I'd be happy to help. Could you please provide more details about what you need assistance with?";
  } else if (message.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  } else if (message.includes('bye')) {
    return "Goodbye! Feel free to reach out if you need anything else.";
  } else if (message.includes('voice')) {
    return "Would you like to switch to a voice call? I can call you if you provide your phone number.";
  } else {
    return `I understand you're asking about "${userMessage}". Let me help you with that. What specific information are you looking for?`;
  }
}

console.log('Test script loaded successfully');
