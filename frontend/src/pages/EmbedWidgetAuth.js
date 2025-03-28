import React, { useState } from 'react';
import axios from 'axios';

const EmbedWidgetAuth = () => {
  const [widgetId, setWidgetId] = useState('');
  const [domain, setDomain] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [token, setToken] = useState('');

  const handleAuth = async () => {
    try {
      const response = await axios.post('/embed/auth', { widgetId, domain, visitorId });
      setToken(response.data.token);
    } catch (error) {
      console.error('Error authenticating widget:', error);
    }
  };

  return (
    <div>
      <h1>Authenticate Widget</h1>
      <input type="text" placeholder="Widget ID" value={widgetId} onChange={(e) => setWidgetId(e.target.value)} />
      <input type="text" placeholder="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
      <input type="text" placeholder="Visitor ID" value={visitorId} onChange={(e) => setVisitorId(e.target.value)} />
      <button onClick={handleAuth}>Authenticate</button>
      {token && <p>Token: {token}</p>}
    </div>
  );
};

export default EmbedWidgetAuth;
