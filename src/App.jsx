import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DeliveriesPage from './pages/admin/DeliveriesPage';
import DriversPage from './pages/admin/DriversPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AdminProfilePage from './pages/admin/ProfilePage';
import SettingsPage from './pages/admin/SettingsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import EarningsManagementPage from './pages/admin/EarningsManagementPage';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import MyDeliveries from './pages/driver/MyDeliveries';
import ProfilePage from './pages/driver/ProfilePage';
import EarningsPage from './pages/driver/EarningsPage';
import DriverNotificationsPage from './pages/driver/NotificationsPage';

// Public Pages
import TrackDelivery from './pages/public/TrackDelivery';

// Layout Components
import AdminLayout from './components/layouts/AdminLayout';
import DriverLayout from './components/layouts/DriverLayout';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/track/:deliveryCode?" element={<TrackDelivery />} />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="deliveries" element={<DeliveriesPage />} />
                        <Route path="drivers" element={<DriversPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="earnings" element={<EarningsManagementPage />} />
                        <Route path="profile" element={<AdminProfilePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Driver Routes */}
              <Route
                path="/driver/*"
                element={
                  <ProtectedRoute requiredRole="driver">
                    <DriverLayout>
                      <Routes>
                        <Route index element={<DriverDashboard />} />
                        <Route path="deliveries" element={<MyDeliveries />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="earnings" element={<EarningsPage />} />
                        <Route path="notifications" element={<DriverNotificationsPage />} />
                      </Routes>
                    </DriverLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;