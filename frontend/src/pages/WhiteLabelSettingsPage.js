import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { whiteLabelService } from '../services/api';

const WhiteLabelSettingsPage = () => {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [settings, setSettings] = useState({
    companyName: '',
    supportEmail: '',
    supportPhone: '',
    privacyPolicyUrl: '',
    termsOfServiceUrl: '',
    customCss: '',
    customJs: '',
    enableCustomBranding: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [backgroundPreview, setBackgroundPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await whiteLabelService.getWhiteLabelSettings(organizationId);
        setSettings(data);
        
        if (data.logoUrl) setLogoPreview(data.logoUrl);
        if (data.faviconUrl) setFaviconPreview(data.faviconUrl);
        if (data.loginBackgroundUrl) setBackgroundPreview(data.loginBackgroundUrl);
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load white label settings');
        setLoading(false);
      }
    };

    fetchSettings();
  }, [organizationId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setSaving(true);
      await whiteLabelService.updateWhiteLabelSettings(organizationId, settings);
      setSuccess('White label settings updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleFaviconChange = (e) => {
    if (e.target.files[0]) {
      setFaviconFile(e.target.files[0]);
      setFaviconPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleBackgroundChange = (e) => {
    if (e.target.files[0]) {
      setBackgroundFile(e.target.files[0]);
      setBackgroundPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    try {
      setUploadingLogo(true);
      const result = await whiteLabelService.uploadLogo(organizationId, formData);
      setLogoPreview(result.logoUrl);
      setSuccess('Logo uploaded successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const uploadFavicon = async () => {
    if (!faviconFile) return;
    
    const formData = new FormData();
    formData.append('favicon', faviconFile);
    
    try {
      setUploadingFavicon(true);
      const result = await whiteLabelService.uploadFavicon(organizationId, formData);
      setFaviconPreview(result.faviconUrl);
      setSuccess('Favicon uploaded successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload favicon');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const uploadBackground = async () => {
    if (!backgroundFile) return;
    
    const formData = new FormData();
    formData.append('background', backgroundFile);
    
    try {
      setUploadingBackground(true);
      const result = await whiteLabelService.uploadBackground(organizationId, formData);
      setBackgroundPreview(result.backgroundUrl);
      setSuccess('Background uploaded successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload background');
    } finally {
      setUploadingBackground(false);
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

  return (
    <Container className="py-3">
      <Row className="mb-4">
        <Col>
          <h1>White Label Settings</h1>
          <p className="text-muted">
            Customize the appearance and branding of your application
          </p>
        </Col>
        <Col className="text-end">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Tabs defaultActiveKey="branding" className="mb-4">
        <Tab eventKey="branding" title="Branding">
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-3">Company Information</h4>
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="companyName"
                        value={settings.companyName || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Support Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="supportEmail"
                        value={settings.supportEmail || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Support Phone</Form.Label>
                      <Form.Control
                        type="text"
                        name="supportPhone"
                        value={settings.supportPhone || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Enable Custom Branding"
                        name="enableCustomBranding"
                        checked={settings.enableCustomBranding || false}
                        onChange={handleChange}
                      />
                      <Form.Text className="text-muted">
                        Enable to use custom CSS and JavaScript
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Privacy Policy URL</Form.Label>
                      <Form.Control
                        type="url"
                        name="privacyPolicyUrl"
                        value={settings.privacyPolicyUrl || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Terms of Service URL</Form.Label>
                      <Form.Control
                        type="url"
                        name="termsOfServiceUrl"
                        value={settings.termsOfServiceUrl || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="images" title="Images & Logo">
          <Card className="mb-4">
            <Card.Body>
              <h4 className="mb-3">Logo</h4>
              
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Upload Logo</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <Form.Text className="text-muted">
                      Recommended size: 200x50 pixels, PNG or SVG format
                    </Form.Text>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    className="mt-2"
                    onClick={uploadLogo}
                    disabled={!logoFile || uploadingLogo}
                  >
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </Col>
                
                <Col md={6}>
                  {logoPreview && (
                    <div className="text-center">
                      <p>Logo Preview:</p>
                      <img 
                        src={logoPreview} 
                        alt="Logo Preview" 
                        style={{ maxHeight: '100px', maxWidth: '100%' }} 
                      />
                    </div>
                  )}
                </Col>
              </Row>
              
              <hr />
              
              <h4 className="mb-3">Favicon</h4>
              
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Upload Favicon</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/x-icon,image/png"
                      onChange={handleFaviconChange}
                    />
                    <Form.Text className="text-muted">
                      Recommended size: 32x32 pixels, ICO or PNG format
                    </Form.Text>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    className="mt-2"
                    onClick={uploadFavicon}
                    disabled={!faviconFile || uploadingFavicon}
                  >
                    {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                  </Button>
                </Col>
                
                <Col md={6}>
                  {faviconPreview && (
                    <div className="text-center">
                      <p>Favicon Preview:</p>
                      <img 
                        src={faviconPreview} 
                        alt="Favicon Preview" 
                        style={{ maxHeight: '32px' }} 
                      />
                    </div>
                  )}
                </Col>
              </Row>
              
              <hr />
              
              <h4 className="mb-3">Login Background</h4>
              
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Upload Login Background</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundChange}
                    />
                    <Form.Text className="text-muted">
                      Recommended size: 1920x1080 pixels, JPG or PNG format
                    </Form.Text>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    className="mt-2"
                    onClick={uploadBackground}
                    disabled={!backgroundFile || uploadingBackground}
                  >
                    {uploadingBackground ? 'Uploading...' : 'Upload Background'}
                  </Button>
                </Col>
                
                <Col md={6}>
                  {backgroundPreview && (
                    <div className="text-center">
                      <p>Background Preview:</p>
                      <img 
                        src={backgroundPreview} 
                        alt="Background Preview" 
                        style={{ maxHeight: '150px', maxWidth: '100%' }} 
                      />
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="custom-code" title="Custom Code">
          <Card>
            <Card.Body>
              <h4 className="mb-3">Custom CSS & JavaScript</h4>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Custom CSS</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="customCss"
                    value={settings.customCss || ''}
                    onChange={handleChange}
                    rows={8}
                    placeholder="/* Add your custom CSS here */"
                  />
                  <Form.Text className="text-muted">
                    Custom CSS will be applied to all pages of your application
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Custom JavaScript</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="customJs"
                    value={settings.customJs || ''}
                    onChange={handleChange}
                    rows={8}
                    placeholder="// Add your custom JavaScript here"
                  />
                  <Form.Text className="text-muted">
                    Custom JavaScript will be executed on all pages of your application
                  </Form.Text>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default WhiteLabelSettingsPage;
