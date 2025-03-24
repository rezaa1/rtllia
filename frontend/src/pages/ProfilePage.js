import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../utils/AuthContext';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { currentUser, updateProfile } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        password: '',
        confirmPassword: ''
      });
      setLoading(false);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setUpdating(true);
      
      // Only include password if it was provided
      const updateData = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateProfile(updateData);
      setSuccess('Profile updated successfully');
      
      // Clear password fields
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
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
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4">
            <h1 className="mb-4">My Profile</h1>
            
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h4 className="mt-4 mb-3">Change Password</h4>
              <p className="text-muted mb-3">Leave blank to keep current password</p>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Button 
                variant="primary" 
                type="submit"
                className="mt-3"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
