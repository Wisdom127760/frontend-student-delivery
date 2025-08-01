import React, { createContext, useContext, useState, useEffect } from 'react';
import socketService from '../services/socketService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Check for existing token/session
        const storedToken = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (storedToken && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                if (parsedUser && typeof parsedUser === 'object') {
                    setUser(parsedUser);
                    setToken(storedToken);
                    setIsAuthenticated(true);
                } else {
                    throw new Error('Invalid user data format');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (authData) => {
        try {
            // authData should contain: { user, token, expiresIn }
            const { user: userData, token: authToken } = authData;

            // Validate user data
            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid user data received');
            }

            // Store in localStorage
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Update state
            setUser(userData);
            setToken(authToken);
            setIsAuthenticated(true);

            // Connect to Socket.IO
            console.log('Connecting to socket with user data:', { id: userData.id, userType: userData.userType });
            console.log('Full user data:', userData);
            socketService.connect(userData.id, userData.userType);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Call backend logout endpoint
                const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if backend call fails
        } finally {
            // Disconnect Socket.IO
            socketService.disconnect();

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Update state
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (userData) => {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};