import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f5f7fb;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  
  ${props => props.isUser ? `
    align-self: flex-end;
    background-color: ${props.themeColor};
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background-color: white;
    color: #333;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  `}
`;

const SystemMessage = styled.div`
  align-self: center;
  background-color: #e6e8eb;
  color: #666;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  max-width: 90%;
  text-align: center;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #d32f2f;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 14px;
  text-align: center;
`;

const TypingIndicator = styled.div`
  align-self: flex-start;
  background-color: #e6e8eb;
  color: #666;
  padding: 8px 16px;
  border-radius: 18px;
  font-size: 14px;
  display: flex;
  align-items: center;
  
  .dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #666;
    margin: 0 1px;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  
  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
    } 40% { 
      transform: scale(1.0);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 20px;
  
  svg {
    margin-bottom: 16px;
    color: ${props => props.themeColor};
  }
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

const TimeStamp = styled.div`
  font-size: 10px;
  color: ${props => props.isUser ? 'rgba(255, 255, 255, 0.7)' : '#999'};
  margin-top: 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessages = ({ 
  messages, 
  isTyping, 
  loading, 
  error, 
  themeColor,
  messagesEndRef 
}) => {
  if (loading) {
    return (
      <MessagesContainer>
        <LoadingIndicator>Loading conversation...</LoadingIndicator>
      </MessagesContainer>
    );
  }
  
  if (error) {
    return (
      <MessagesContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </MessagesContainer>
    );
  }
  
  if (messages.length === 0) {
    return (
      <MessagesContainer>
        <EmptyState themeColor={themeColor}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
          </svg>
          <h4>Start a conversation</h4>
          <p>Send a message to begin chatting with our assistant</p>
        </EmptyState>
      </MessagesContainer>
    );
  }
  
  return (
    <MessagesContainer>
      {messages.map((message, index) => {
        const isUser = message.senderType === 'user';
        const isSystem = message.senderType === 'system' || message.messageType === 'system';
        
        if (isSystem) {
          return (
            <SystemMessage key={message.id || index}>
              {message.content}
            </SystemMessage>
          );
        }
        
        return (
          <MessageBubble 
            key={message.id || index} 
            isUser={isUser}
            themeColor={themeColor}
          >
            {message.content}
            <TimeStamp isUser={isUser}>
              {formatTime(message.createdAt)}
            </TimeStamp>
          </MessageBubble>
        );
      })}
      
      {isTyping && (
        <TypingIndicator>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </TypingIndicator>
      )}
      
      <div ref={messagesEndRef} />
    </MessagesContainer>
  );
};

ChatMessages.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      senderType: PropTypes.string.isRequired,
      messageType: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ).isRequired,
  isTyping: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.string,
  themeColor: PropTypes.string.isRequired,
  messagesEndRef: PropTypes.object
};

export default ChatMessages;
