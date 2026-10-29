import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AddNoticePage from './pages/AddNoticePage';
import EditNoticePage from './pages/EditNoticePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <div className="main-content">
            <Routes>
              {/* Public & Student Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/notices" element={<HomePage />} />
              <Route path="/notice/:id" element={<NoticeDetailPage />} />
              <Route path="/login" element={<AdminLoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Legacy admin login redirect */}
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />

              {/* User Profile (Student & Admin) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notices"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notices/create"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AddNoticePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AddNoticePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notices/edit/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <EditNoticePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <EditNoticePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
