// services/auth.js
import api from './api';

export const authService = {
    // Send OTP to email
    sendOTP: async (email, userType) => {
        return await api.post('/auth/send-otp', { email, userType });
    },

    // Verify OTP and login
    verifyOTP: async (email, otp, userType) => {
        return await api.post('/auth/verify-otp', { email, otp, userType });
    },

    // Logout user
    logout: async () => {
        return await api.post('/auth/logout');
    },

    // Refresh JWT token
    refreshToken: async () => {
        return await api.post('/auth/refresh-token');
    },
};