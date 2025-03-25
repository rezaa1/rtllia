import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import components
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AgentCreatePage from './pages/AgentCreatePage';
import AgentDetailPage from './pages/AgentDetailPage';
import CallsPage from './pages/CallsPage';
import WhiteLabelSettingsPage from './pages/WhiteLabelSettingsPage';

// Import context
import { AuthProvider } from './utils/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Navigation />
      <Container>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Agent routes */}
          <Route path="/agents" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/agents/create" element={
            <ProtectedRoute>
              <AgentCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/agents/:id" element={
            <ProtectedRoute>
              <AgentDetailPage />
            </ProtectedRoute>
          } />

          {/* Call routes */}
          <Route path="/calls" element={
            <ProtectedRoute>
              <CallsPage />
            </ProtectedRoute>
          } />

          {/* Organization routes */}
          <Route path="/organization/white-label" element={
            <ProtectedRoute>
              <WhiteLabelSettingsPage />
            </ProtectedRoute>
          } />

          {/* User routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Fallback route */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Container>
    </AuthProvider>
  );
}

export default App