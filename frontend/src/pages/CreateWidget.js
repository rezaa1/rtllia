import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext'; // Import the Auth context

const CreateWidget = () => {
  const { currentUser } = useAuth(); // Get the current user from context
  console.log('Current User:', currentUser);
  console.log('Token:', currentUser ? currentUser.token : 'No token found'); // Check if token is defined
  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [themeColor, setThemeColor] = useState('#0088FF');
  const [headerText, setHeaderText] = useState('Chat with us');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [allowedDomains, setAllowedDomains] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.token) {
      console.error('No valid token found. Cannot create widget.');
      return; // Prevent submission if token is not available
    }
    try {
      const response = await axios.post('/api/widgets', {
        name,
        agentId,
        themeColor,
        headerText,
        welcomeMessage,
        allowedDomains: allowedDomains.split(',').map(domain => domain.trim()), // Convert to array
      }, {
        headers: {
          Authorization: `Bearer ${currentUser.token}` // Ensure this is defined
        }
      });
      console.log('Widget created:', response.data);
    } catch (error) {
      console.error('Error creating widget:', error);
    }
  };

  return (
    <div>
      <h1>Create Widget Configuration</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Widget Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Agent ID" value={agentId} onChange={(e) => setAgentId(e.target.value)} required />
        <input type="text" placeholder="Theme Color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} />
        <input type="text" placeholder="Header Text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} />
        <textarea placeholder="Welcome Message" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
        <input type="text" placeholder="Allowed Domains (comma separated)" value={allowedDomains} onChange={(e) => setAllowedDomains(e.target.value)} />
        <button type="submit">Create Widget</button>
      </form>
    </div>
  );
};

export default CreateWidget; 