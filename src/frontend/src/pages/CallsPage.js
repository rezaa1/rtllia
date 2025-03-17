import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { callService } from '../services/api';

const CallsPage = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const data = await callService.getCalls();
        setCalls(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load calls. Please try again.');
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  return (
    <Container className="py-3">
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Call History</h1>
        </Col>
        <Col className="text-end">
          <Link to="/dashboard">
            <Button variant="outline-primary">Back to Dashboard</Button>
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
      ) : calls.length === 0 ? (
        <Card className="p-5 text-center">
          <h3>No call history found</h3>
          <p className="mt-3">
            You haven't made any calls with your AI voice agents yet.
          </p>
          <div className="mt-3">
            <Link to="/dashboard">
              <Button variant="primary">Go to Dashboard</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Agent</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Direction</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call._id}>
                    <td>{new Date(call.createdAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/agents/${call.agent._id}`}>
                        {call.agent.name}
                      </Link>
                    </td>
                    <td>{call.fromNumber}</td>
                    <td>{call.toNumber}</td>
                    <td>{call.direction}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadgeColor(call.status)}`}>
                        {call.status}
                      </span>
                    </td>
                    <td>{call.duration ? `${call.duration}s` : 'N/A'}</td>
                    <td>
                      <Link to={`/agents/${call.agent._id}`} className="btn btn-sm btn-info">
                        View Agent
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

// Helper function to determine badge color based on call status
const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'initiated':
      return 'primary';
    case 'in-progress':
      return 'info';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default CallsPage;
