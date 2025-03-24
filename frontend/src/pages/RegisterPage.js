import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const { username, email, password, confirmPassword, firstName, lastName } = formData;
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await register({
        username,
        email,
        password,
        firstName,
        lastName
      });
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-md-center my-5">
      <Col md={8}>
        <Card className="p-4">
          <h2 className="text-center mb-4">Create an Account</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username*</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email Address*</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="lastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password*</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm Password*</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mt-3"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default RegisterPage;
