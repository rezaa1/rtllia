import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Link to="/" className="navbar-brand">Retell AI Integration</Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {currentUser ? (
              <>
                <NavDropdown title="Agents" id="agents-dropdown">
                  <Link to="/agents" className="dropdown-item">All Agents</Link>
                  <Link to="/agents/create" className="dropdown-item">Create Agent</Link>
                </NavDropdown>
                
                <NavDropdown title="Calls" id="calls-dropdown">
                  <Link to="/calls" className="dropdown-item">Call History</Link>
                  <Link to="/calls/stats" className="dropdown-item">Call Statistics</Link>
                </NavDropdown>
                
                {currentUser.isOrganizationAdmin && (
                  <NavDropdown title="Organization" id="org-dropdown">
                    <Link to="/organization/settings" className="dropdown-item">Settings</Link>
                    <Link to="/organization/users" className="dropdown-item">Users</Link>
                    <Link to="/organization/white-label" className="dropdown-item">White Label</Link>
                    <Link to="/organization/billing" className="dropdown-item">Billing</Link>
                  </NavDropdown>
                )}
                
                <NavDropdown title={currentUser.username} id="user-dropdown">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;