// components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.userType !== requiredRole) {
        // Redirect to appropriate dashboard based on user type
        const redirectPath = user?.userType === 'admin' ? '/admin' : '/driver';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;