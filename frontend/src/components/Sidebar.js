import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaHome, 
  FaRobot, 
  FaPhone, 
  FaCog, 
  FaPalette, 
  FaUsers, 
  FaCreditCard 
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar bg-light border-end" style={{ minHeight: '100vh', width: '250px', position: 'fixed', left: 0, top: '56px' }}>
      <Nav className="flex-column p-3">
        <Nav.Item>
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <FaHome className="me-2" /> Dashboard
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link 
            to="/agents" 
            className={`nav-link ${isActive('/agents') ? 'active' : ''}`}
          >
            <FaRobot className="me-2" /> Agents
          </Link>
        </Nav.Item>

        <Nav.Item>
          <Link 
            to="/calls" 
            className={`nav-link ${isActive('/calls') ? 'active' : ''}`}
          >
            <FaPhone className="me-2" /> Calls
          </Link>
        </Nav.Item>

        {currentUser?.isOrganizationAdmin && (
          <>
            <hr />
            <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
              Organization
            </h6>

            <Nav.Item>
              <Link 
                to="/organization/settings" 
                className={`nav-link ${isActive('/organization/settings') ? 'active' : ''}`}
              >
                <FaCog className="me-2" /> Settings
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link 
                to="/organization/white-label" 
                className={`nav-link ${isActive('/organization/white-label') ? 'active' : ''}`}
              >
                <FaPalette className="me-2" /> White Label
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link 
                to="/organization/users" 
                className={`nav-link ${isActive('/organization/users') ? 'active' : ''}`}
              >
                <FaUsers className="me-2" /> Users
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link 
                to="/organization/billing" 
                className={`nav-link ${isActive('/organization/billing') ? 'active' : ''}`}
              >
                <FaCreditCard className="me-2" /> Billing
              </Link>
            </Nav.Item>
          </>
        )}
      </Nav>
    </div>
  );
};

export default Sidebar;