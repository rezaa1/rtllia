import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/organizations">Organizations</Link>
        </li>
        <li>
          <Link to="/widgets">Widgets</Link>
        </li>
        <li>
          <Link to="/widgets/create">Create Widget</Link>
        </li>
        <li>
          <Link to="/organization/white-label">White Label Settings</Link>
        </li>
        <li>
          <Link to="/embed/auth">Embed Widget Auth</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 