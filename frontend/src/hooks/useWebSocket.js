import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for WebSocket communication
 * @param {string} url - WebSocket URL to connect to
 * @returns {Object} WebSocket state and methods
 */
export const useWebSocket = (url) => {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Connect to WebSocket
  useEffect(() => {
    // Don't connect if URL is not provided
    if (!url) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnected(true);
          setReconnectAttempt(0);
        };

        ws.onmessage = (event) => {
          setLastMessage(event);
        };

        ws.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason);
          setConnected(false);
          
          // Attempt to reconnect if not closed cleanly
          if (event.code !== 1000) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
            console.log(`Reconnecting in ${timeout}ms (attempt ${reconnectAttempt + 1})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempt(prev => prev + 1);
              connectWebSocket();
            }, timeout);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url, reconnectAttempt]);

  // Send message function
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
      return true;
    }
    return false;
  }, []);

  return {
    connected,
    sendMessage,
    lastMessage,
    reconnectAttempt
  };
};
