import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Settings from './pages/Settings';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-center text-white">
          <div className="spinner-lg text-white mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-center text-white">
          <div className="spinner-lg text-white mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="chat" element={<Chat />} />
          <Route path="upload" element={<Upload />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
