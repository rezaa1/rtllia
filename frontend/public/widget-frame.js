// Widget Frame Script
// This script initializes the chat widget inside the iframe

// Store widget instance
let chatWidgetInstance = null;

// Initialize chat widget with configuration
window.initChatWidget = function(config) {
  // Create root element for React
  const rootElement = document.getElementById('root');
  
  // Load React and other dependencies
  Promise.all([
    loadScript('https://unpkg.com/react@17/umd/react.production.min.js'),
    loadScript('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js'),
    loadScript('https://unpkg.com/styled-components@5/dist/styled-components.min.js')
  ]).then(() => {
    // Create chat widget component
    createChatWidget(rootElement, config);
  }).catch(error => {
    console.error('Error loading dependencies:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: #d32f2f; text-align: center;">
        <h3>Widget Loading Error</h3>
        <p>Failed to load widget dependencies. Please try again later.</p>
      </div>
    `;
  });
};

// Load script asynchronously
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Create chat widget component
function createChatWidget(container, config) {
  // Mock implementation of the chat widget
  // In a real implementation, this would use React to render the actual widget components
  
  const { 
    widgetId, 
    agentId, 
    visitorId, 
    themeColor, 
    headerText, 
    welcomeMessage, 
    token,
    onClose,
    onMinimize
  } = config;
  
  // Create a simple widget UI
  container.innerHTML = `
    <div id="chat-widget" style="display: flex; flex-direction: column; height: 100%; background-color: #ffffff; font-family: 'Inter', sans-serif;">
      <div id="chat-header" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background-color: ${themeColor}; color: white;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${headerText}</h3>
        <div style="display: flex; gap: 8px;">
          <button id="minimize-button" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H5V11H19V13Z" fill="white"/>
            </svg>
          </button>
          <button id="close-button" style="background: none; border: none; color: white; cursor: pointer; padding: 4px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
            </svg>
          </button>
        </div>
      </div>
      <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 16px; background-color: #f5f7fb;">
        <div style="align-self: flex-start; background-color: white; color: #333; padding: 10px 14px; border-radius: 18px; font-size: 14px; max-width: 80%; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">
          ${welcomeMessage}
        </div>
      </div>
      <div id="chat-input" style="display: flex; align-items: center; padding: 12px 16px; background-color: white; border-top: 1px solid #e0e0e0;">
        <input id="message-input" type="text" placeholder="Type your message..." style="flex: 1; border: 1px solid #e0e0e0; border-radius: 20px; padding: 10px 16px; font-size: 14px; outline: none;">
        <button id="send-button" style="background-color: ${themeColor}; color: white; border: none; border-radius: 50%; width: 36px; height: 36px; margin-left: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/>
          </svg>
        </button>
        <button id="voice-button" style="background-color: transparent; color: ${themeColor}; border: 1px solid ${themeColor}; border-radius: 50%; width: 36px; height: 36px; margin-left: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 15.5C18.8 15.5 17.5 15.3 16.4 14.9C16.3 14.9 16.2 14.9 16.1 14.9C15.8 14.9 15.6 15 15.4 15.2L13.2 17.4C10.4 15.9 8 13.6 6.6 10.8L8.8 8.6C9.1 8.3 9.2 7.9 9 7.6C8.7 6.5 8.5 5.2 8.5 4C8.5 3.5 8 3 7.5 3H4C3.5 3 3 3.5 3 4C3 13.4 10.6 21 20 21C20.5 21 21 20.5 21 20V16.5C21 16 20.5 15.5 20 15.5Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('close-button').addEventListener('click', () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  });
  
  document.getElementById('minimize-button').addEventListener('click', () => {
    if (typeof onMinimize === 'function') {
      onMinimize();
    }
  });
  
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  
  // Send message function
  const sendMessage = () => {
    const message = messageInput.value.trim();
    if (message) {
      // Add user message to chat
      const chatMessages = document.getElementById('chat-messages');
      chatMessages.innerHTML += `
        <div style="align-self: flex-end; background-color: ${themeColor}; color: white; padding: 10px 14px; border-radius: 18px; font-size: 14px; max-width: 80%; margin-bottom: 12px; align-self: flex-end; margin-left: auto;">
          ${message}
        </div>
      `;
      
      // Clear input
      messageInput.value = '';
      
      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Simulate agent response after a delay
      setTimeout(() => {
        chatMessages.innerHTML += `
          <div style="align-self: flex-start; background-color: white; color: #333; padding: 10px 14px; border-radius: 18px; font-size: 14px; max-width: 80%; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">
            I'm a simulated response. In a real implementation, this would come from the backend via WebSocket.
          </div>
        `;
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 1000);
    }
  };
  
  // Add send button click handler
  sendButton.addEventListener('click', sendMessage);
  
  // Add enter key handler
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Add voice button click handler
  document.getElementById('voice-button').addEventListener('click', () => {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
      <div style="align-self: center; background-color: #e6e8eb; color: #666; padding: 6px 12px; border-radius: 16px; font-size: 12px; max-width: 90%; text-align: center; margin-bottom: 12px;">
        To switch to voice mode, please provide your phone number in a real implementation.
      </div>
    `;
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
  
  // Store instance for potential future reference
  chatWidgetInstance = {
    config,
    container
  };
  
  // Log successful initialization
  console.log('Chat widget initialized with config:', config);
}
