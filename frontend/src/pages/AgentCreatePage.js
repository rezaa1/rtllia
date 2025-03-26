import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { agentService, resourceService } from '../services/api';

const AgentCreatePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    voiceId: '', // Will be populated from API
    llmConfig: {
      model: '',
      s2sModel: '',
      temperature: 0,
      highPriority: false,
      generalPrompt: 'You are a helpful AI assistant.'
    }
  });
  
  const [resources, setResources] = useState({
    voices: [],
    models: [],
    s2sModels: []
  });
  
  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [error, setError] = useState('');
  const [compatibilityError, setCompatibilityError] = useState('');
  const [modelType, setModelType] = useState('standard'); // 'standard' or 'realtime'
  const navigate = useNavigate();

  // Fetch available resources when component mounts
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setResourcesLoading(true);
        const data = await resourceService.getAvailableResources();
        
        // Extract models and s2s models from availableModels
        const models = data.availableModels?.models || [];
        const s2sModels = data.availableModels?.s2sModels || [];
        
        setResources({
          voices: data.voices || [],
          models,
          s2sModels
        });
        
        // Set default values if available
        if (data.voices && data.voices.length > 0) {
          // Find a non-elevenlabs voice for default if available (to avoid compatibility issues)
          const defaultVoice = data.voices.find(v => v.provider !== 'elevenlabs') || data.voices[0];
          
          // Set initial form data with first available options
          setFormData(prev => ({
            ...prev,
            voiceId: defaultVoice.voice_id,
            llmConfig: {
              ...prev.llmConfig,
              model: models.length > 0 ? models[0] : '',
              s2sModel: ''  // Start with empty s2s_model
            }
          }));
        }
        
        setResourcesLoading(false);
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        setError('Failed to load voices and models. Please refresh the page.');
        setResourcesLoading(false);
      }
    };
    
    fetchResources();
  }, []);

  // Check compatibility when voice or s2s model changes
  useEffect(() => {
    const checkCompatibility = async () => {
      // Only check if both voice and s2s model are selected
      if (formData.voiceId && formData.llmConfig.s2sModel && modelType === 'realtime') {
        try {
          const result = await resourceService.checkCompatibility(
            formData.voiceId, 
            formData.llmConfig.s2sModel
          );
          
          if (!result.compatible) {
            setCompatibilityError(`This voice is not compatible with the selected speech-to-speech model.`);
          } else {
            setCompatibilityError('');
          }
        } catch (error) {
          setCompatibilityError(error.response?.data?.message || 'Compatibility check failed');
        }
      } else {
        setCompatibilityError('');
      }
    };
    
    checkCompatibility();
  }, [formData.voiceId, formData.llmConfig.s2sModel, modelType]);

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

  const handleModelTypeChange = (type) => {
    setModelType(type);
    
    // Clear the other model type when switching
    if (type === 'standard') {
      setFormData({
        ...formData,
        llmConfig: {
          ...formData.llmConfig,
          s2sModel: ''
        }
      });
    } else {
      setFormData({
        ...formData,
        llmConfig: {
          ...formData.llmConfig,
          model: ''
        }
      });
    }
  };

  const handleRefreshResources = async () => {
    try {
      setResourcesLoading(true);
      setError('');
      
      const data = await resourceService.refreshResources();
      
      // Extract models and s2s models
      const models = data.availableModels?.models || [];
      const s2sModels = data.availableModels?.s2sModels || [];
      
      setResources({
        voices: data.voices || [],
        models,
        s2sModels
      });
      
      setResourcesLoading(false);
    } catch (error) {
      console.error('Failed to refresh resources:', error);
      setError('Failed to refresh voices and models. Please try again.');
      setResourcesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check for compatibility errors
    if (compatibilityError) {
      setError('Please resolve compatibility issues before creating the agent.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a copy of the form data to modify before submission
      const submissionData = {
        ...formData,
        llmConfig: { ...formData.llmConfig }
      };
      
      // Remove the model that's not being used based on modelType
      if (modelType === 'standard') {
        delete submissionData.llmConfig.s2sModel;
      } else {
        delete submissionData.llmConfig.model;
      }
      
      await agentService.createAgent(submissionData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create agent. Please try again.');
      setLoading(false);
    }
  };

  // Group voices by provider for better organization
  const groupedVoices = resources.voices.reduce((acc, voice) => {
    const provider = voice.provider || 'Other';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(voice);
    return acc;
  }, {});

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="p-4">
            <h1 className="mb-4">Create New AI Voice Agent</h1>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {compatibilityError && <Alert variant="warning">{compatibilityError}</Alert>}
            
            {resourcesLoading ? (
              <div className="text-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading resources...</span>
                </Spinner>
                <p className="mt-3">Loading available voices and models...</p>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                <div className="d-flex justify-content-end mb-3">
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleRefreshResources}
                    disabled={resourcesLoading}
                  >
                    {resourcesLoading ? 'Refreshing...' : 'Refresh Resources'}
                  </Button>
                </div>
                
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
                  <Form.Label>Voice* ({resources.voices.length} available)</Form.Label>
                  <Form.Select
                    name="voiceId"
                    value={formData.voiceId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a voice</option>
                    {Object.entries(groupedVoices).map(([provider, voices]) => (
                      <optgroup key={provider} label={provider.charAt(0).toUpperCase() + provider.slice(1)}>
                        {voices.map(voice => (
                          <option key={voice.voice_id} value={voice.voice_id}>
                            {voice.voice_name} ({voice.gender}, {voice.accent})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Form.Select>
                  {formData.voiceId && formData.llmConfig.s2sModel && modelType === 'realtime' && (
                    <Form.Text className={compatibilityError ? "text-danger" : "text-success"}>
                      {compatibilityError || "✓ Voice is compatible with selected model"}
                    </Form.Text>
                  )}
                </Form.Group>
                
                <h4 className="mt-4 mb-3">LLM Configuration</h4>
                
                <Form.Group className="mb-3">
                  <Form.Label>Model Type*</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Standard Model"
                      name="modelTypeRadio"
                      id="standardModel"
                      checked={modelType === 'standard'}
                      onChange={() => handleModelTypeChange('standard')}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Real-time Speech-to-Speech Model"
                      name="modelTypeRadio"
                      id="realtimeModel"
                      checked={modelType === 'realtime'}
                      onChange={() => handleModelTypeChange('realtime')}
                    />
                  </div>
                  <Form.Text className="text-muted">
                    Choose one model type. Standard models are for text processing, while real-time models are for speech-to-speech conversations.
                  </Form.Text>
                </Form.Group>
                
                {modelType === 'standard' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Model* ({resources.models.length} available)</Form.Label>
                    <Form.Select
                      name="model"
                      value={formData.llmConfig.model}
                      onChange={handleLlmConfigChange}
                      required={modelType === 'standard'}
                    >
                      <option value="">Select a model</option>
                      {resources.models.map(model => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
                
                {modelType === 'realtime' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Speech-to-Speech Model* ({resources.s2sModels.length} available)</Form.Label>
                    <Form.Select
                      name="s2sModel"
                      value={formData.llmConfig.s2sModel}
                      onChange={handleLlmConfigChange}
                      required={modelType === 'realtime'}
                    >
                      <option value="">Select a speech-to-speech model</option>
                      {resources.s2sModels.map(model => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
                
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
                    disabled={loading || resourcesLoading || !!compatibilityError}
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
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AgentCreatePage;
