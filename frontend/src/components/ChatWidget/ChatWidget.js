import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import VoiceInterface from './VoiceInterface';
import { useWebSocket } from '../../hooks/useWebSocket';
import API from '../../services/api';

const WidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
`;

const ChatWidget = ({
  widgetId,
  agentId,
  visitorId,
  themeColor = '#0088FF',
  headerText = 'Chat with us',
  welcomeMessage = 'Hello! How can I help you today?',
  onClose,
  onMinimize,
  token
}) => {
  const [chatSessionId, setChatSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('chat'); // 'chat' or 'voice'
  const [callDetails, setCallDetails] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  // WebSocket connection
  const { 
    connected, 
    sendMessage, 
    lastMessage 
  } = useWebSocket(
    chatSessionId ? 
      `${process.env.REACT_APP_WS_URL || 'ws://localhost:5000'}/chat?sessionId=${chatSessionId}&token=${token}` : 
      null
  );

  // Create chat session on mount
  useEffect(() => {
    const createChatSession = async () => {
      try {
        setLoading(true);
        const response = await API.post('/chat/sessions', {
          agentId,
          visitorId,
          welcomeMessage
        });
        
        setChatSessionId(response.data.id);
        
        // Add welcome message if it exists
        if (welcomeMessage) {
          setMessages([{
            id: 'welcome',
            sessionId: response.data.id,
            senderType: 'agent',
            messageType: 'text',
            content: welcomeMessage,
            createdAt: new Date().toISOString()
          }]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error creating chat session:', err);
        setError('Failed to start chat session. Please try again later.');
        setLoading(false);
      }
    };
    
    if (agentId && visitorId && token) {
      createChatSession();
    }
    
    return () => {
      // End chat session on unmount if it exists
      if (chatSessionId) {
        API.put(`/chat/sessions/${chatSessionId}`, {
          status: 'ended'
        }).catch(err => {
          console.error('Error ending chat session:', err);
        });
      }
    };
  }, [agentId, visitorId, welcomeMessage, token]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        switch (data.type) {
          case 'message:received':
            setMessages(prev => [...prev, data.message]);
            if (data.message.senderType === 'agent') {
              setIsTyping(false);
            }
            break;
          case 'typing:start':
            if (data.senderId === 'agent') {
              setIsTyping(true);
            }
            break;
          case 'typing:stop':
            if (data.senderId === 'agent') {
              setIsTyping(false);
            }
            break;
          case 'mode:changed':
            setMode(data.mode);
            if (data.mode === 'voice' && data.callDetails) {
              setCallDetails(data.callDetails);
            }
            if (data.message) {
              setMessages(prev => [...prev, data.message]);
            }
            break;
          case 'error':
            console.error('WebSocket error:', data.error);
            setError(data.error);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    }
  }, [lastMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message handler
  const handleSendMessage = (content) => {
    if (!content.trim() || !chatSessionId || !connected) return;
    
    // Send message via WebSocket
    sendMessage(JSON.stringify({
      type: 'message:send',
      content,
      messageType: 'text',
      timestamp: new Date().toISOString()
    }));
  };

  // Switch to voice mode
  const handleSwitchToVoice = (phoneNumber) => {
    if (!chatSessionId || !connected) return;
    
    // Send mode change request via WebSocket
    sendMessage(JSON.stringify({
      type: 'mode:change',
      mode: 'voice',
      phoneNumber,
      timestamp: new Date().toISOString()
    }));
  };

  // Handle typing indicator
  const handleTypingIndicator = (isTyping) => {
    if (!chatSessionId || !connected) return;
    
    sendMessage(JSON.stringify({
      type: isTyping ? 'typing:start' : 'typing:stop',
      senderId: 'user',
      timestamp: new Date().toISOString()
    }));
  };

  return (
    <WidgetContainer>
      <ChatHeader 
        themeColor={themeColor}
        headerText={headerText}
        onClose={onClose}
        onMinimize={onMinimize}
        mode={mode}
      />
      
      {mode === 'chat' ? (
        <>
          <ChatMessages 
            messages={messages}
            isTyping={isTyping}
            loading={loading}
            error={error}
            themeColor={themeColor}
            messagesEndRef={messagesEndRef}
          />
          <ChatInput 
            onSendMessage={handleSendMessage}
            onSwitchToVoice={handleSwitchToVoice}
            onTyping={handleTypingIndicator}
            themeColor={themeColor}
            disabled={!connected || loading}
          />
        </>
      ) : (
        <VoiceInterface 
          callDetails={callDetails}
          themeColor={themeColor}
          onSwitchToChat={() => setMode('chat')}
        />
      )}
    </WidgetContainer>
  );
};

ChatWidget.propTypes = {
  widgetId: PropTypes.string.isRequired,
  agentId: PropTypes.number.isRequired,
  visitorId: PropTypes.string.isRequired,
  themeColor: PropTypes.string,
  headerText: PropTypes.string,
  welcomeMessage: PropTypes.string,
  onClose: PropTypes.func,
  onMinimize: PropTypes.func,
  token: PropTypes.string.isRequired
};

export default ChatWidget;
