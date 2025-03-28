import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
`;

const TextInput = styled.input`
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: ${props => props.themeColor};
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  background-color: ${props => props.themeColor};
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VoiceButton = styled.button`
  background-color: transparent;
  color: ${props => props.themeColor};
  border: 1px solid ${props => props.themeColor};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => `${props.themeColor}10`};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PhoneNumberModal = styled.div`
  position: absolute;
  bottom: 70px;
  right: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  width: 250px;
  z-index: 10;
`;

const ModalTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
`;

const PhoneInput = styled.input`
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  margin-bottom: 12px;
  outline: none;
  
  &:focus {
    border-color: ${props => props.themeColor};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ModalButton = styled.button`
  background-color: ${props => props.primary ? props.themeColor : 'transparent'};
  color: ${props => props.primary ? 'white' : '#666'};
  border: ${props => props.primary ? 'none' : '1px solid #e0e0e0'};
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ChatInput = ({ 
  onSendMessage, 
  onSwitchToVoice, 
  onTyping,
  themeColor, 
  disabled 
}) => {
  const [message, setMessage] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Handle typing indicator
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1000);
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleVoiceClick = () => {
    setShowPhoneModal(true);
  };
  
  const handleSwitchToVoice = () => {
    if (phoneNumber.trim()) {
      onSwitchToVoice(phoneNumber);
      setShowPhoneModal(false);
      setPhoneNumber('');
    }
  };
  
  return (
    <InputContainer>
      <TextInput
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        themeColor={themeColor}
      />
      
      <SendButton 
        onClick={handleSendMessage} 
        disabled={!message.trim() || disabled}
        themeColor={themeColor}
        title="Send message"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="white"/>
        </svg>
      </SendButton>
      
      <VoiceButton 
        onClick={handleVoiceClick} 
        disabled={disabled}
        themeColor={themeColor}
        title="Switch to voice call"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 15.5C18.8 15.5 17.5 15.3 16.4 14.9C16.3 14.9 16.2 14.9 16.1 14.9C15.8 14.9 15.6 15 15.4 15.2L13.2 17.4C10.4 15.9 8 13.6 6.6 10.8L8.8 8.6C9.1 8.3 9.2 7.9 9 7.6C8.7 6.5 8.5 5.2 8.5 4C8.5 3.5 8 3 7.5 3H4C3.5 3 3 3.5 3 4C3 13.4 10.6 21 20 21C20.5 21 21 20.5 21 20V16.5C21 16 20.5 15.5 20 15.5Z" fill="currentColor"/>
        </svg>
      </VoiceButton>
      
      {showPhoneModal && (
        <PhoneNumberModal>
          <ModalTitle>Enter your phone number</ModalTitle>
          <PhoneInput
            type="tel"
            placeholder="+1 (555) 555-5555"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            themeColor={themeColor}
          />
          <ModalButtons>
            <ModalButton onClick={() => setShowPhoneModal(false)}>
              Cancel
            </ModalButton>
            <ModalButton 
              primary 
              themeColor={themeColor}
              onClick={handleSwitchToVoice}
            >
              Call me
            </ModalButton>
          </ModalButtons>
        </PhoneNumberModal>
      )}
    </InputContainer>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onSwitchToVoice: PropTypes.func.isRequired,
  onTyping: PropTypes.func.isRequired,
  themeColor: PropTypes.string.isRequired,
  disabled: PropTypes.bool
};

export default ChatInput;
