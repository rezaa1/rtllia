# Chat/Voice Widget Documentation

## Overview

The Chat/Voice Widget is a feature that allows users to embed a chat interface in their websites that supports both text chat and voice conversations with Retell AI agents. This widget provides a seamless experience for website visitors to interact with AI agents, starting with text chat and optionally transitioning to voice calls.

## Table of Contents

1. [Backend Components](#backend-components)
2. [Frontend Components](#frontend-components)
3. [Embedding Guide](#embedding-guide)
4. [Configuration Options](#configuration-options)
5. [API Reference](#api-reference)
6. [WebSocket Events](#websocket-events)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

## Backend Components

### Database Schema

The chat/voice widget uses the following database tables:

#### Chat Sessions Table
Stores information about active and past chat sessions.

```sql
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    visitor_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);
```

#### Chat Messages Table
Stores all messages exchanged in chat sessions.

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    chat_session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'agent', 'system'
    message_type VARCHAR(20) NOT NULL, -- 'text', 'voice', 'system'
    content TEXT NOT NULL,
    voice_url VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Widget Configurations Table
Stores widget configurations for organizations.

```sql
CREATE TABLE widget_configurations (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    theme_color VARCHAR(20) DEFAULT '#0088FF',
    header_text VARCHAR(100) DEFAULT 'Chat with us',
    welcome_message TEXT,
    allowed_domains TEXT[], -- Domains where widget can be embedded
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Models

The backend uses Sequelize models to interact with the database:

- **ChatSession**: Represents a chat conversation between a visitor and an agent
- **ChatMessage**: Represents individual messages in a chat session
- **WidgetConfiguration**: Stores configuration for widget embedding

### Controllers

#### Chat Controller (`chatController.js`)

Handles chat-related API endpoints:

- `createChatSession`: Creates a new chat session
- `getChatSessionById`: Retrieves a specific chat session
- `getChatMessages`: Gets messages for a chat session
- `sendChatMessage`: Sends a message in a chat session
- `updateChatSession`: Updates chat session status
- `transitionToVoice`: Transitions a chat session to a voice call

#### Widget Controller (`widgetController.js`)

Handles widget configuration API endpoints:

- `createWidgetConfiguration`: Creates a new widget configuration
- `getWidgetConfigurationById`: Retrieves a specific widget configuration
- `updateWidgetConfiguration`: Updates a widget configuration
- `deleteWidgetConfiguration`: Deletes a widget configuration
- `getWidgetConfigurationsByOrganization`: Gets all widget configurations for an organization

### Services

#### Chat Service (`chatService.js`)

Provides chat functionality:

- `getAgentResponse`: Gets agent response for a chat message
- `transitionToVoice`: Transitions from chat to voice call
- `getChatHistory`: Gets chat session history

#### WebSocket Service (`webSocketService.js`)

Handles real-time communication:

- Manages WebSocket connections
- Broadcasts messages to connected clients
- Handles typing indicators
- Manages mode changes between chat and voice

### Routes

#### Chat Routes (`chatRoutes.js`)

```javascript
router.post('/sessions', protect, chatController.createChatSession);
router.get('/sessions/:id', protect, chatController.getChatSessionById);
router.put('/sessions/:id', protect, chatController.updateChatSession);
router.get('/sessions/:id/messages', protect, chatController.getChatMessages);
router.post('/sessions/:id/messages', protect, chatController.sendChatMessage);
router.post('/sessions/:id/voice', protect, chatController.transitionToVoice);
```

#### Widget Routes (`widgetRoutes.js`)

```javascript
router.post('/', protect, widgetController.createWidgetConfiguration);
router.get('/:id', protect, widgetController.getWidgetConfigurationById);
router.put('/:id', protect, widgetController.updateWidgetConfiguration);
router.delete('/:id', protect, widgetController.deleteWidgetConfiguration);
router.get('/organization/:orgId', protect, widgetController.getWidgetConfigurationsByOrganization);
```

#### Embed Routes (`embedRoutes.js`)

```javascript
router.post('/auth', authenticateWidget);
router.get('/widget.js', serveWidgetScript);
router.get('/widget-frame.html', serveWidgetFrame);
router.get('/widget-frame.js', serveWidgetFrameScript);
router.get('/config/:widgetId', getWidgetConfig);
```

## Frontend Components

### Widget Container (`ChatWidget.js`)

The main component that hosts the chat and voice interfaces:

- Manages widget lifecycle
- Handles initialization and configuration
- Controls widget visibility and positioning
- Manages transitions between chat and voice modes

```jsx
<ChatWidget
  widgetId="widget-123"
  agentId={1}
  visitorId="visitor-456"
  themeColor="#0088FF"
  headerText="Chat with us"
  welcomeMessage="Hello! How can I help you today?"
  onClose={() => {}}
  onMinimize={() => {}}
  token="jwt-token"
/>
```

### Chat Header (`ChatHeader.js`)

Displays the widget header with title and control buttons:

- Shows widget title
- Displays current mode (chat/voice)
- Provides minimize and close buttons

### Chat Messages (`ChatMessages.js`)

Displays the message history:

- Shows user and agent messages
- Displays system messages
- Shows typing indicators
- Handles loading states and errors

### Chat Input (`ChatInput.js`)

Provides the message input interface:

- Text input for messages
- Send button
- Voice mode switch button
- Phone number input for voice transition

### Voice Interface (`VoiceInterface.js`)

Provides the voice call interface:

- Displays call status
- Shows call duration
- Provides call controls (end call)
- Allows switching back to chat

### WebSocket Hook (`useWebSocket.js`)

Custom React hook for WebSocket communication:

- Establishes and maintains WebSocket connections
- Sends and receives messages
- Handles reconnection logic
- Manages connection state

## Embedding Guide

### Basic Embedding

To embed the chat widget in your website, add the following script tag to your HTML:

```html
<script src="https://api.retellai.com/embed/widget.js?id=YOUR_WIDGET_ID" async></script>
```

Replace `YOUR_WIDGET_ID` with the ID of your widget configuration.

### JavaScript API

The widget provides a JavaScript API for controlling it programmatically:

```javascript
// Open the widget
window.rtlChatWidget.open();

// Close the widget
window.rtlChatWidget.close();

// Toggle the widget
window.rtlChatWidget.toggle();
```

### Advanced Configuration

You can customize the widget by setting configuration options before loading the script:

```html
<script>
  window.rtlChatWidget = {
    widgetId: 'YOUR_WIDGET_ID',
    config: {
      position: 'bottom-right',
      themeColor: '#0088FF',
      headerText: 'Chat with us',
      welcomeMessage: 'Hello! How can I help you today?',
      autoOpen: false
    }
  };
</script>
<script src="https://api.retellai.com/embed/widget.js" async></script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | string | `'bottom-right'` | Widget position on the page. Options: `'bottom-right'`, `'bottom-left'`, `'top-right'`, `'top-left'` |
| `themeColor` | string | `'#0088FF'` | Primary color for the widget |
| `headerText` | string | `'Chat with us'` | Text displayed in the widget header |
| `welcomeMessage` | string | `'Hello! How can I help you today?'` | Initial message from the agent |
| `autoOpen` | boolean | `false` | Whether to automatically open the widget when loaded |
| `width` | string | `'350px'` | Width of the widget |
| `height` | string | `'550px'` | Height of the widget |

## API Reference

### Authentication

```
POST /embed/auth
```

**Request Body:**
```json
{
  "widgetId": "widget-123",
  "domain": "example.com",
  "visitorId": "visitor-456"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "agentId": 1,
  "themeColor": "#0088FF",
  "headerText": "Chat with us"
}
```

### Widget Configuration

```
GET /embed/config/:widgetId
```

**Response:**
```json
{
  "id": "widget-123",
  "agentId": 1,
  "themeColor": "#0088FF",
  "headerText": "Chat with us",
  "welcomeMessage": "Hello! How can I help you today?"
}
```

### Chat Sessions

```
POST /api/chat/sessions
```

**Request Body:**
```json
{
  "agentId": 1,
  "visitorId": "visitor-456",
  "welcomeMessage": "Hello! How can I help you today?"
}
```

**Response:**
```json
{
  "id": "session-789",
  "organizationId": 1,
  "agentId": 1,
  "visitorId": "visitor-456",
  "status": "active",
  "metadata": {},
  "createdAt": "2025-03-28T10:00:00Z"
}
```

### Chat Messages

```
POST /api/chat/sessions/:id/messages
```

**Request Body:**
```json
{
  "content": "Hello, I have a question",
  "messageType": "text",
  "metadata": {}
}
```

**Response:**
```json
{
  "userMessage": {
    "id": "msg-123",
    "sessionId": "session-789",
    "senderType": "user",
    "messageType": "text",
    "content": "Hello, I have a question",
    "metadata": {},
    "createdAt": "2025-03-28T10:01:00Z"
  },
  "agentMessage": {
    "id": "msg-124",
    "sessionId": "session-789",
    "senderType": "agent",
    "messageType": "text",
    "content": "Hello! How can I help you today?",
    "metadata": {},
    "createdAt": "2025-03-28T10:01:01Z"
  }
}
```

### Voice Transition

```
POST /api/chat/sessions/:id/voice
```

**Request Body:**
```json
{
  "phoneNumber": "+15555555555"
}
```

**Response:**
```json
{
  "chatSessionId": "session-789",
  "callId": "call-456",
  "retellCallId": "retell-call-789",
  "status": "connecting",
  "phoneNumber": "+15555555555"
}
```

## WebSocket Events

### Connection Established

```json
{
  "type": "connection:established",
  "sessionId": "session-789",
  "timestamp": "2025-03-28T10:00:00Z"
}
```

### Message Received

```json
{
  "type": "message:received",
  "message": {
    "id": "msg-123",
    "sessionId": "session-789",
    "senderType": "user",
    "messageType": "text",
    "content": "Hello, I have a question",
    "metadata": {},
    "createdAt": "2025-03-28T10:01:00Z"
  },
  "timestamp": "2025-03-28T10:01:00Z"
}
```

### Typing Indicator

```json
{
  "type": "typing:start",
  "senderId": "agent",
  "timestamp": "2025-03-28T10:01:00Z"
}
```

```json
{
  "type": "typing:stop",
  "senderId": "agent",
  "timestamp": "2025-03-28T10:01:02Z"
}
```

### Mode Change

```json
{
  "type": "mode:changed",
  "mode": "voice",
  "callDetails": {
    "retellCallId": "retell-call-789",
    "status": "connecting",
    "phoneNumber": "+15555555555"
  },
  "message": {
    "id": "msg-125",
    "sessionId": "session-789",
    "senderType": "system",
    "messageType": "system",
    "content": "Transitioning to voice call. Calling +15555555555...",
    "createdAt": "2025-03-28T10:02:00Z"
  },
  "timestamp": "2025-03-28T10:02:00Z"
}
```

## Usage Examples

### Basic Embedding

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  
  <!-- Chat Widget Embed -->
  <script src="https://api.retellai.com/embed/widget.js?id=YOUR_WIDGET_ID" async></script>
</body>
</html>
```

### Custom Configuration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  
  <!-- Chat Widget with Custom Configuration -->
  <script>
    window.rtlChatWidget = {
      widgetId: 'YOUR_WIDGET_ID',
      config: {
        position: 'bottom-left',
        themeColor: '#FF5500',
        headerText: 'Ask our AI Assistant',
        welcomeMessage: 'Hi there! I'm your AI assistant. How can I help you today?',
        autoOpen: true
      }
    };
  </script>
  <script src="https://api.retellai.com/embed/widget.js" async></script>
</body>
</html>
```

### Programmatic Control

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  
  <button id="open-chat">Chat with us</button>
  
  <!-- Chat Widget Embed -->
  <script src="https://api.retellai.com/embed/widget.js?id=YOUR_WIDGET_ID" async></script>
  
  <script>
    document.getElementById('open-chat').addEventListener('click', function() {
      if (window.rtlChatWidget && window.rtlChatWidget.open) {
        window.rtlChatWidget.open();
      }
    });
  </script>
</body>
</html>
```

## Troubleshooting

### Widget Not Loading

If the widget is not loading, check the following:

1. Ensure the widget ID is correct
2. Verify that the domain is allowed in the widget configuration
3. Check browser console for any JavaScript errors
4. Confirm that the API server is accessible

### Authentication Issues

If you're experiencing authentication issues:

1. Verify that the widget is active in the dashboard
2. Check that the domain is properly configured in allowed domains
3. Ensure the JWT secret is properly set in the backend

### WebSocket Connection Problems

If real-time communication is not working:

1. Check if WebSocket connections are blocked by a firewall
2. Verify that the WebSocket server is running
3. Check browser console for WebSocket connection errors
4. Ensure the correct WebSocket URL is being used

### Voice Transition Not Working

If transitioning to voice calls is not working:

1. Verify that Retell API key is properly configured
2. Check that the agent has a valid Retell agent ID
3. Ensure the phone number format is correct
4. Check server logs for any Retell API errors
