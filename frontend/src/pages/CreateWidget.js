import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext'; // Import the Auth context
import { widgetService } from '../services/api'; // Import widgetService as a named export
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const CreateWidget = () => {
  const { currentUser } = useAuth(); // Get the current user from context
  const navigate = useNavigate(); // Initialize navigate
  console.log('Current User:', currentUser);
  console.log('Token:', currentUser ? currentUser.token : 'No token found'); // Check if token is defined
  const [name, setName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [themeColor, setThemeColor] = useState('#0088FF');
  const [headerText, setHeaderText] = useState('Chat with us');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [allowedDomains, setAllowedDomains] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Initialize error state
    try {
      setLoading(true); // Set loading state
      // Create a copy of the form data to modify before submission
      const submissionData = {
        name,
        agentId,
        themeColor,
        headerText,
        welcomeMessage,
        allowedDomains: allowedDomains.split(',').map(domain => domain.trim()), // Convert to array
      };

      await widgetService.createWidget(submissionData); // Use widgetService to create the widget
      console.log('Widget created successfully'); // Log success message
      navigate('/dashboard'); // Navigate to dashboard
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create widget. Please try again.'); // Handle error
    } finally {
      setLoading(false); // Reset loading state
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
        <button type="submit" disabled={loading}>Create Widget</button>
      </form>
    </div>
  );
};

export default CreateWidget; 