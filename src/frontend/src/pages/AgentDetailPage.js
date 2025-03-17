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
    const fetchAgentData = async () => {
      try {
        const agentData = await agentService.getAgentById(id);
        setAgent(agentData);
        
        // Fetch calls for this agent
        const callsData = await callService.getCalls();
        const agentCalls = callsData.filter(call => call.agent._id === id);
        setCalls(agentCalls);
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load agent details. Please try again.');
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
    
    try {
      setCallLoading(true);
      await callService.createCall({
        agentId: id,
        fromNumber: callForm.fromNumber,
        toNumber: callForm.toNumber
      });
      
      setCallSuccess('Call initiated successfully!');
      
      // Refresh calls list
      const callsData = await callService.getCalls();
      const agentCalls = callsData.filter(call => call.agent._id === id);
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
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
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
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
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
                  {agent.llmConfiguration ? (
                    <>
                      <p><strong>Model:</strong> {agent.llmConfiguration.model}</p>
                      <p><strong>S2S Model:</strong> {agent.llmConfiguration.s2sModel || 'Not specified'}</p>
                      <p><strong>Temperature:</strong> {agent.llmConfiguration.temperature}</p>
                      <p><strong>High Priority:</strong> {agent.llmConfiguration.highPriority ? 'Yes' : 'No'}</p>
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
                        <tr key={call._id}>
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
