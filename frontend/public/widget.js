// ChatWidget Embedding Script
// Version 1.0.0

(function() {
  // Configuration
  const DEFAULT_CONFIG = {
    position: 'bottom-right',
    themeColor: '#0088FF',
    headerText: 'Chat with us',
    welcomeMessage: 'Hello! How can I help you today?',
    autoOpen: false,
    width: '350px',
    height: '550px'
  };

  // Widget state
  let widgetState = {
    loaded: false,
    initialized: false,
    open: false,
    minimized: false,
    config: {},
    widgetId: null,
    agentId: null,
    token: null
  };

  // Create a unique visitor ID or retrieve existing one
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('rtl_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('rtl_visitor_id', visitorId);
    }
    return visitorId;
  };

  // Create widget container
  const createWidgetContainer = () => {
    const container = document.createElement('div');
    container.id = 'rtl-chat-widget-container';
    
    // Apply styles
    Object.assign(container.style, {
      position: 'fixed',
      zIndex: '9999',
      display: 'none',
      width: widgetState.config.width,
      height: widgetState.config.height,
      boxShadow: '0 5px 40px rgba(0, 0, 0, 0.16)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    });
    
    // Position the widget
    const position = widgetState.config.position.split('-');
    if (position.includes('bottom')) {
      container.style.bottom = '80px';
    } else {
      container.style.top = '20px';
    }
    
    if (position.includes('right')) {
      container.style.right = '20px';
    } else {
      container.style.left = '20px';
    }
    
    return container;
  };

  // Create widget button
  const createWidgetButton = () => {
    const button = document.createElement('div');
    button.id = 'rtl-chat-widget-button';
    
    // Apply styles
    Object.assign(button.style, {
      position: 'fixed',
      zIndex: '10000',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: widgetState.config.themeColor,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    });
    
    // Position the button
    const position = widgetState.config.position.split('-');
    if (position.includes('bottom')) {
      button.style.bottom = '20px';
    } else {
      button.style.top = '20px';
    }
    
    if (position.includes('right')) {
      button.style.right = '20px';
    } else {
      button.style.left = '20px';
    }
    
    // Add chat icon
    button.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
      </svg>
    `;
    
    // Add click event
    button.addEventListener('click', toggleWidget);
    
    return button;
  };

  // Toggle widget visibility
  const toggleWidget = () => {
    const container = document.getElementById('rtl-chat-widget-container');
    const button = document.getElementById('rtl-chat-widget-button');
    
    if (!widgetState.open) {
      // Open widget
      container.style.display = 'block';
      
      // Add a small delay to allow the display change to take effect before animating
      setTimeout(() => {
        widgetState.open = true;
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
          </svg>
        `;
      }, 10);
    } else {
      // Close widget
      widgetState.open = false;
      container.style.display = 'none';
      button.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
        </svg>
      `;
    }
  };

  // Minimize widget
  const minimizeWidget = () => {
    const container = document.getElementById('rtl-chat-widget-container');
    widgetState.minimized = true;
    container.style.display = 'none';
  };

  // Load widget iframe
  const loadWidgetIframe = () => {
    const container = document.getElementById('rtl-chat-widget-container');
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'rtl-chat-widget-iframe';
    
    // Apply styles
    Object.assign(iframe.style, {
      width: '100%',
      height: '100%',
      border: 'none',
      backgroundColor: 'white'
    });
    
    // Set source
    const apiBase = window.rtlChatWidget.apiBase || 'https://api.retellai.com';
    const params = new URLSearchParams({
      widgetId: widgetState.widgetId,
      agentId: widgetState.agentId,
      visitorId: getVisitorId(),
      themeColor: encodeURIComponent(widgetState.config.themeColor),
      headerText: encodeURIComponent(widgetState.config.headerText),
      welcomeMessage: encodeURIComponent(widgetState.config.welcomeMessage),
      token: widgetState.token
    });
    
    iframe.src = `${apiBase}/embed/widget-frame.html?${params.toString()}`;
    
    // Add iframe to container
    container.appendChild(iframe);
    
    // Set up message event listener for iframe communication
    window.addEventListener('message', handleIframeMessage);
    
    widgetState.loaded = true;
  };

  // Handle messages from iframe
  const handleIframeMessage = (event) => {
    // Verify origin
    const apiBase = window.rtlChatWidget.apiBase || 'https://api.retellai.com';
    const origin = new URL(apiBase).origin;
    
    if (event.origin !== origin) {
      return;
    }
    
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'widget:ready':
          widgetState.initialized = true;
          break;
        case 'widget:close':
          toggleWidget();
          break;
        case 'widget:minimize':
          minimizeWidget();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling iframe message:', error);
    }
  };

  // Initialize widget
  const initWidget = async () => {
    try {
      // Merge default config with user config
      widgetState.config = { ...DEFAULT_CONFIG, ...window.rtlChatWidget.config };
      
      // Get widget ID and agent ID
      widgetState.widgetId = window.rtlChatWidget.widgetId;
      widgetState.agentId = window.rtlChatWidget.agentId;
      
      // Validate required parameters
      if (!widgetState.widgetId) {
        throw new Error('Widget ID is required');
      }
      
      if (!widgetState.agentId) {
        throw new Error('Agent ID is required');
      }
      
      // Get authentication token
      await getAuthToken();
      
      // Create DOM elements
      const container = createWidgetContainer();
      const button = createWidgetButton();
      
      // Add elements to DOM
      document.body.appendChild(container);
      document.body.appendChild(button);
      
      // Load widget iframe
      loadWidgetIframe();
      
      // Auto-open widget if configured
      if (widgetState.config.autoOpen) {
        setTimeout(toggleWidget, 1000);
      }
    } catch (error) {
      console.error('Error initializing chat widget:', error);
    }
  };

  // Get authentication token
  const getAuthToken = async () => {
    try {
      const apiBase = window.rtlChatWidget.apiBase || 'https://api.retellai.com';
      
      const response = await fetch(`${apiBase}/embed/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widgetId: widgetState.widgetId,
          domain: window.location.hostname,
          visitorId: getVisitorId()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to authenticate widget');
      }
      
      const data = await response.json();
      widgetState.token = data.token;
      
      return data.token;
    } catch (error) {
      console.error('Error getting authentication token:', error);
      throw error;
    }
  };

  // Public API
  window.rtlChatWidget = window.rtlChatWidget || {};
  
  // Extend public API
  window.rtlChatWidget.open = () => {
    if (!widgetState.open) {
      toggleWidget();
    }
  };
  
  window.rtlChatWidget.close = () => {
    if (widgetState.open) {
      toggleWidget();
    }
  };
  
  window.rtlChatWidget.toggle = toggleWidget;
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
