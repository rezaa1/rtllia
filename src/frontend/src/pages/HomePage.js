import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={8}>
          <h1 className="display-4 mb-4">Create AI Voice Agents with Retell AI</h1>
          <p className="lead mb-4">
            Build, manage, and deploy sophisticated AI voice agents for your business using our intuitive platform.
            Our integration with Retell AI provides state-of-the-art voice technology with easy management.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register">
              <Button variant="primary" size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline-primary" size="lg">Login</Button>
            </Link>
          </div>
        </Col>
      </Row>

      <Row className="mt-5 pt-5">
        <Col md={4} className="mb-4">
          <div className="text-center p-4 h-100 border rounded">
            <h3>Create Voice Agents</h3>
            <p>
              Design custom AI voice agents with different voices and personalities to match your brand.
              Configure your agent's behavior and responses to create natural conversations.
            </p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="text-center p-4 h-100 border rounded">
            <h3>Manage Phone Calls</h3>
            <p>
              Initiate and monitor phone calls handled by your AI agents.
              Track call history, duration, and performance to optimize your customer interactions.
            </p>
          </div>
        </Col>
        <Col md={4} className="mb-4">
          <div className="text-center p-4 h-100 border rounded">
            <h3>Analyze Performance</h3>
            <p>
              Get insights into your AI agents' performance with detailed analytics.
              Improve your agents over time based on real conversation data.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
