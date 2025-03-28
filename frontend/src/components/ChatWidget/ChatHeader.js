import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${props => props.themeColor};
  color: white;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
`;

const HeaderText = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ModeIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-right: 8px;
  
  svg {
    margin-right: 4px;
  }
`;

const ChatHeader = ({ themeColor, headerText, onClose, onMinimize, mode }) => {
  return (
    <Header themeColor={themeColor}>
      <HeaderText>{headerText}</HeaderText>
      
      <HeaderControls>
        <ModeIndicator>
          {mode === 'chat' ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
              </svg>
              Chat
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 15.5C18.8 15.5 17.5 15.3 16.4 14.9C16.3 14.9 16.2 14.9 16.1 14.9C15.8 14.9 15.6 15 15.4 15.2L13.2 17.4C10.4 15.9 8 13.6 6.6 10.8L8.8 8.6C9.1 8.3 9.2 7.9 9 7.6C8.7 6.5 8.5 5.2 8.5 4C8.5 3.5 8 3 7.5 3H4C3.5 3 3 3.5 3 4C3 13.4 10.6 21 20 21C20.5 21 21 20.5 21 20V16.5C21 16 20.5 15.5 20 15.5Z" fill="white"/>
              </svg>
              Voice
            </>
          )}
        </ModeIndicator>
        
        {onMinimize && (
          <ControlButton onClick={onMinimize} title="Minimize">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H5V11H19V13Z" fill="white"/>
            </svg>
          </ControlButton>
        )}
        
        {onClose && (
          <ControlButton onClick={onClose} title="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
            </svg>
          </ControlButton>
        )}
      </HeaderControls>
    </Header>
  );
};

ChatHeader.propTypes = {
  themeColor: PropTypes.string.isRequired,
  headerText: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onMinimize: PropTypes.func,
  mode: PropTypes.oneOf(['chat', 'voice']).isRequired
};

export default ChatHeader;
