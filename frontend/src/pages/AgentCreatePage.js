import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { agentService } from '../services/api';

const AgentCreatePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    voiceId: '11labs-Adrian', // Default voice
    llmConfig: {
      model: 'gpt-4o',
      s2sModel: 'gpt-4o-realtime',
      temperature: 0,
      highPriority: false,
      generalPrompt: 'You are a helpful AI assistant.'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLlmConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : 
               type === 'number' ? parseFloat(value) : value;
    
    setFormData({
      ...formData,
      llmConfig: {
        ...formData.llmConfig,
        [name]: val
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      await agentService.createAgent(formData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create agent. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="p-4">
            <h1 className="mb-4">Create New AI Voice Agent</h1>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <h4 className="mt-3 mb-3">Basic Information</h4>
              
              <Form.Group className="mb-3">
                <Form.Label>Agent Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter a name for your agent"
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what this agent does"
                  rows={3}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Voice*</Form.Label>
                <Form.Select
                  name="voiceId"
                  value={formData.voiceId}
                  onChange={handleChange}
                  required
                >
                  <option value="11labs-Adrian">Adrian (Male)</option>
                  <option value="11labs-Rachel">Rachel (Female)</option>
                  <option value="11labs-Domi">Domi (Female)</option>
                  <option value="11labs-Antoni">Antoni (Male)</option>
                  <option value="11labs-Thomas">Thomas (Male)</option>
                </Form.Select>
              </Form.Group>
              
              <h4 className="mt-4 mb-3">LLM Configuration</h4>
              
              <Form.Group className="mb-3">
                <Form.Label>Model*</Form.Label>
                <Form.Select
                  name="model"
                  value={formData.llmConfig.model}
                  onChange={handleLlmConfigChange}
                  required
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Speech-to-Speech Model*</Form.Label>
                <Form.Select
                  name="s2sModel"
                  value={formData.llmConfig.s2sModel}
                  onChange={handleLlmConfigChange}
                  required
                >
                  <option value="gpt-4o-realtime">GPT-4o Realtime</option>
                  <option value="gpt-3.5-turbo-realtime">GPT-3.5 Turbo Realtime</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Temperature (0-1)</Form.Label>
                <Form.Control
                  type="number"
                  name="temperature"
                  value={formData.llmConfig.temperature}
                  onChange={handleLlmConfigChange}
                  min="0"
                  max="1"
                  step="0.1"
                />
                <Form.Text className="text-muted">
                  Lower values make responses more deterministic, higher values more creative.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="High Priority Processing"
                  name="highPriority"
                  checked={formData.llmConfig.highPriority}
                  onChange={handleLlmConfigChange}
                />
                <Form.Text className="text-muted">
                  Enable for faster processing (may incur additional costs).
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>General Prompt</Form.Label>
                <Form.Control
                  as="textarea"
                  name="generalPrompt"
                  value={formData.llmConfig.generalPrompt}
                  onChange={handleLlmConfigChange}
                  placeholder="Instructions for your AI agent"
                  rows={4}
                />
                <Form.Text className="text-muted">
                  Define how your agent should behave and respond.
                </Form.Text>
              </Form.Group>
              
              <div className="d-grid gap-2 mt-4">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Agent...' : 'Create Agent'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgentCreatePage;
