import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { agentService, callService } from '../services/api';

const AgentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [agent, setAgent] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [callForm, setCallForm] = useState({
    fromNumber: '',
    toNumber: ''
  });
  const [callLoading, setCallLoading] = useState(false);
  const [callError, setCallError] = useState('');
  const [callSuccess, setCallSuccess] = useState('');

  useEffect(() => {
    console.log('Agent ID from URL:', id);

    const fetchAgentData = async () => {
      try {
        // Validate agent ID before making API request
        if (!id || id === 'undefined' || id === 'null') {
          console.error('Invalid agent ID:', id);
          setError('Invalid agent ID. Please select a valid agent.');
          setLoading(false);
          return;
        }

        // Ensure ID is a valid number
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
          console.error('Agent ID is not a valid number:', id);
          setError('Agent ID must be a valid number.');
          setLoading(false);
          return;
        }

        console.log('Fetching agent with ID:', parsedId);
        const agentData = await agentService.getAgentById(parsedId);
        setAgent(agentData);
        
        // Fetch calls for this agent
        const callsData = await callService.getCalls();
        // Use 'id' instead of '_id' for Sequelize compatibility
        const agentCalls = callsData.filter(call => call.agent && call.agent.id === parsedId);
        setCalls(agentCalls);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching agent data:', error);
        setError(error.response?.data?.message || 'Failed to load agent details. Please try again.');
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [id]);

  const handleCallFormChange = (e) => {
    const { name, value } = e.target;
    setCallForm({
      ...callForm,
      [name]: value
    });
  };

  const handleMakeCall = async (e) => {
    e.preventDefault();
    setCallError('');
    setCallSuccess('');
    
    if (!callForm.fromNumber || !callForm.toNumber) {
      setCallError('Please provide both phone numbers');
      return;
    }
    
    // Validate agent ID before making API request
    if (!id || id === 'undefined' || id === 'null') {
      setCallError('Invalid agent ID. Cannot make call with invalid agent.');
      return;
    }

    // Ensure ID is a valid number
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      setCallError('Agent ID must be a valid number.');
      return;
    }
    
    try {
      setCallLoading(true);
      await callService.createCall({
        agentId: parsedId, // Use parsed ID
        fromNumber: callForm.fromNumber,
        toNumber: callForm.toNumber
      });
      
      setCallSuccess('Call initiated successfully!');
      
      // Refresh calls list
      const callsData = await callService.getCalls();
      // Use 'id' instead of '_id' for Sequelize compatibility
      const agentCalls = callsData.filter(call => call.agent && call.agent.id === parsedId);
      setCalls(agentCalls);
      
      // Reset form
      setCallForm({
        fromNumber: '',
        toNumber: ''
      });
    } catch (error) {
      setCallError(error.response?.data?.message || 'Failed to initiate call. Please try again.');
    } finally {
      setCallLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/agents')}>
          Back to Agents
        </Button>
      </Container>
    );
  }

  // Additional validation to ensure agent data is available
  if (!agent) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Agent not found or data is unavailable.</Alert>
        <Button variant="primary" onClick={() => navigate('/agents')}>
          Back to Agents
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-3">
      <Row className="mb-4">
        <Col>
          <h1>{agent.name}</h1>
          <p className="text-muted">
            Created on {new Date(agent.createdAt).toLocaleDateString()}
          </p>
        </Col>
        <Col className="text-end">
          <Button 
            variant="outline-secondary" 
            className="me-2"
            onClick={() => navigate('/agents')}
          >
            Back to Agents
          </Button>
        </Col>
      </Row>

      <Tabs defaultActiveKey="details" className="mb-4">
        <Tab eventKey="details" title="Agent Details">
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>Basic Information</h5>
                  <p><strong>Description:</strong> {agent.description || 'No description'}</p>
                  <p><strong>Voice ID:</strong> {agent.voiceId}</p>
                  <p><strong>Retell Agent ID:</strong> {agent.retellAgentId}</p>
                </Col>
                <Col md={6}>
                  <h5>LLM Configuration</h5>
                  {agent.llmConfig ? (
                    <>
                      <p><strong>Model:</strong> {agent.llmConfig.model || 'Not specified'}</p>
                      <p><strong>S2S Model:</strong> {agent.llmConfig.s2sModel || 'Not specified'}</p>
                      <p><strong>Temperature:</strong> {agent.llmConfig.temperature}</p>
                      <p><strong>High Priority:</strong> {agent.llmConfig.highPriority ? 'Yes' : 'No'}</p>
                    </>
                  ) : (
                    <p>No LLM configuration available</p>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="make-call" title="Make a Call">
          <Card className="mb-4">
            <Card.Body>
              <h4>Make a Phone Call</h4>
              
              {callError && <Alert variant="danger">{callError}</Alert>}
              {callSuccess && <Alert variant="success">{callSuccess}</Alert>}
              
              <Form onSubmit={handleMakeCall}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>From Number*</Form.Label>
                      <Form.Control
                        type="text"
                        name="fromNumber"
                        value={callForm.fromNumber}
                        onChange={handleCallFormChange}
                        placeholder="+14157774444"
                        required
                      />
                      <Form.Text className="text-muted">
                        Must be in E.164 format (e.g., +14157774444)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>To Number*</Form.Label>
                      <Form.Control
                        type="text"
                        name="toNumber"
                        value={callForm.toNumber}
                        onChange={handleCallFormChange}
                        placeholder="+12137774445"
                        required
                      />
                      <Form.Text className="text-muted">
                        Must be in E.164 format (e.g., +12137774445)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={callLoading}
                >
                  {callLoading ? 'Initiating Call...' : 'Make Call'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="call-history" title="Call History">
          <Card>
            <Card.Body>
              <h4>Call History</h4>
              
              {calls.length === 0 ? (
                <p>No calls have been made with this agent yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Direction</th>
                        <th>Status</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calls.map(call => (
                        <tr key={call.id}>
                          <td>{new Date(call.createdAt).toLocaleString()}</td>
                          <td>{call.fromNumber}</td>
                          <td>{call.toNumber}</td>
                          <td>{call.direction}</td>
                          <td>{call.status}</td>
                          <td>{call.duration ? `${call.duration}s` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AgentDetailPage;
