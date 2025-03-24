import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header>
      <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          <Link to="/" className="navbar-brand">Retell AI Integration</Link>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/calls" className="nav-link">Call History</Link>
                  
                  <NavDropdown title={currentUser.username || 'Account'} id="username">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <NavDropdown.Item onClick={handleLogout}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Sign In</Link>
                  <Link to="/register" className="nav-link">Register</Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
