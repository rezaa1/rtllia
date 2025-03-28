import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const VoiceContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f5f7fb;
`;

const CallStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24px;
`;

const StatusIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${props => props.status === 'connected' ? props.themeColor : props.status === 'connecting' ? '#FFA000' : '#F44336'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
  
  svg {
    width: 40px;
    height: 40px;
  }
`;

const StatusText = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const StatusSubtext = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  max-width: 240px;
`;

const CallTimer = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 8px;
`;

const CallControls = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

const ControlButton = styled.button`
  background-color: ${props => props.danger ? '#F44336' : props.themeColor};
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const SwitchButton = styled.button`
  background-color: transparent;
  color: ${props => props.themeColor};
  border: 1px solid ${props => props.themeColor};
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 24px;
  
  &:hover {
    background-color: ${props => `${props.themeColor}10`};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const VoiceInterface = ({ callDetails, themeColor, onSwitchToChat }) => {
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  useEffect(() => {
    // Simulate call connection process
    if (callDetails) {
      const timer = setTimeout(() => {
        setCallStatus('connected');
        
        // Start call timer
        const interval = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        
        setTimerInterval(interval);
      }, 3000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [callDetails]);
  
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);
  
  const handleEndCall = () => {
    setCallStatus('ended');
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    // Wait a moment before switching back to chat
    setTimeout(() => {
      onSwitchToChat();
    }, 1500);
  };
  
  const renderStatusIcon = () => {
    switch (callStatus) {
      case 'connected':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 15.5C18.8 15.5 17.5 15.3 16.4 14.9C16.3 14.9 16.2 14.9 16.1 14.9C15.8 14.9 15.6 15 15.4 15.2L13.2 17.4C10.4 15.9 8 13.6 6.6 10.8L8.8 8.6C9.1 8.3 9.2 7.9 9 7.6C8.7 6.5 8.5 5.2 8.5 4C8.5 3.5 8 3 7.5 3H4C3.5 3 3 3.5 3 4C3 13.4 10.6 21 20 21C20.5 21 21 20.5 21 20V16.5C21 16 20.5 15.5 20 15.5Z" fill="white"/>
          </svg>
        );
      case 'connecting':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="white"/>
          </svg>
        );
      case 'ended':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9C10.4 9 8.85 9.25 7.4 9.72V12.82C7.4 13.21 7.17 13.56 6.84 13.72C5.86 14.21 4.97 14.84 4.18 15.57C4 15.75 3.75 15.85 3.48 15.85C3.2 15.85 2.95 15.74 2.77 15.56L0.29 13.08C0.11 12.91 0 12.66 0 12.38C0 12.1 0.11 11.85 0.28 11.67C3.13 8.95 7.42 7.5 12 7.5C16.58 7.5 20.87 8.95 23.72 11.67C23.89 11.85 24 12.1 24 12.38C24 12.66 23.89 12.91 23.71 13.08L21.23 15.56C21.05 15.74 20.8 15.85 20.52 15.85C20.25 15.85 20 15.75 19.82 15.57C19.03 14.84 18.14 14.21 17.16 13.72C16.83 13.56 16.6 13.21 16.6 12.82V9.72C15.15 9.25 13.6 9 12 9Z" fill="white"/>
          </svg>
        );
      default:
        return null;
    }
  };
  
  const getStatusText = () => {
    switch (callStatus) {
      case 'connected':
        return 'Call in progress';
      case 'connecting':
        return 'Connecting call...';
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };
  
  const getStatusSubtext = () => {
    switch (callStatus) {
      case 'connected':
        return `Connected to ${callDetails?.phoneNumber || 'agent'}`;
      case 'connecting':
        return 'Please wait while we connect your call';
      case 'ended':
        return 'Returning to chat mode';
      default:
        return '';
    }
  };
  
  return (
    <VoiceContainer>
      <CallStatus>
        <StatusIcon status={callStatus} themeColor={themeColor}>
          {renderStatusIcon()}
        </StatusIcon>
        <StatusText>{getStatusText()}</StatusText>
        <StatusSubtext>{getStatusSubtext()}</StatusSubtext>
        
        {callStatus === 'connected' && (
          <CallTimer>
            {formatTime(callDuration)}
          </CallTimer>
        )}
      </CallStatus>
      
      {callStatus === 'connected' && (
        <CallControls>
          <ControlButton 
            danger 
            onClick={handleEndCall}
            title="End call"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9C10.4 9 8.85 9.25 7.4 9.72V12.82C7.4 13.21 7.17 13.56 6.84 13.72C5.86 14.21 4.97 14.84 4.18 15.57C4 15.75 3.75 15.85 3.48 15.85C3.2 15.85 2.95 15.74 2.77 15.56L0.29 13.08C0.11 12.91 0 12.66 0 12.38C0 12.1 0.11 11.85 0.28 11.67C3.13 8.95 7.42 7.5 12 7.5C16.58 7.5 20.87 8.95 23.72 11.67C23.89 11.85 24 12.1 24 12.38C24 12.66 23.89 12.91 23.71 13.08L21.23 15.56C21.05 15.74 20.8 15.85 20.52 15.85C20.25 15.85 20 15.75 19.82 15.57C19.03 14.84 18.14 14.21 17.16 13.72C16.83 13.56 16.6 13.21 16.6 12.82V9.72C15.15 9.25 13.6 9 12 9Z" fill="white"/>
            </svg>
          </ControlButton>
        </CallControls>
      )}
      
      {callStatus === 'connected' && (
        <SwitchButton 
          onClick={onSwitchToChat}
          themeColor={themeColor}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
          </svg>
          Switch to chat
        </SwitchButton>
      )}
    </VoiceContainer>
  );
};

VoiceInterface.propTypes = {
  callDetails: PropTypes.shape({
    retellCallId: PropTypes.string,
    status: PropTypes.string,
    phoneNumber: PropTypes.string
  }),
  themeColor: PropTypes.string.isRequired,
  onSwitchToChat: PropTypes.func.isRequired
};

export default VoiceInterface;
