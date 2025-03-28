import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { agentService } from '../services/api';

const DashboardPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agentService.getAgents();
        setAgents(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load agents. Please try again.');
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const handleDeleteAgent = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await agentService.deleteAgent(id);
        setAgents(agents.filter(agent => agent._id !== id));
      } catch (error) {
        setError('Failed to delete agent. Please try again.');
      }
    }
  };

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-4">
        <Col>
          <h1>My AI Voice Agents</h1>
        </Col>
        <Col className="text-end">
          <Link to="/agents/create">
            <Button variant="primary">Create New Agent</Button>
          </Link>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : agents.length === 0 ? (
        <Card className="p-5 text-center">
          <h3>You don't have any AI voice agents yet</h3>
          <p className="mt-3">
            Create your first AI voice agent to start making phone calls with Retell AI technology.
          </p>
          <div className="mt-3">
            <Link to="/agents/create">
              <Button variant="primary" size="lg">Create Your First Agent</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Voice</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id}>
                <td>{agent._id}</td>
                <td>{agent.name}</td>
                <td>{agent.description || 'No description'}</td>
                <td>{agent.voiceId}</td>
                <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/agents/${agent._id}`} className="btn btn-sm btn-info me-2">
                    View
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDeleteAgent(agent._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default DashboardPage;
