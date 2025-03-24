import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import only essential pages for testing
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Simple components for testing
const SimplePage = () => (
  <div className="text-center py-5">
    <h1>Simple Test Page</h1>
    <p>If you can see this, basic rendering is working correctly.</p>
    <div className="mt-4">
      <a href="/login" className="btn btn-primary mx-2">Go to Login</a>
      <a href="/register" className="btn btn-secondary mx-2">Go to Register</a>
    </div>
  </div>
);

function App() {
  return (
    <main className="py-3">
      <Container>
        <Routes>
          {/* Use a simple component for the home route */}
          <Route path="/" element={<SimplePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Fallback route */}
          <Route path="*" element={<SimplePage />} />
        </Routes>
      </Container>
    </main>
  );
}

export default App;
