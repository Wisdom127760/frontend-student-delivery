// services/driver.js
import api from './api';

export const driverService = {
    // Profile
    getProfile: async () => {
        return await api.get('/driver/profile');
    },

    updateProfile: async (profileData) => {
        return await api.put('/driver/profile', profileData);
    },

    toggleOnlineStatus: async () => {
        return await api.post('/driver/toggle-online');
    },

    toggleActiveStatus: async () => {
        console.log('Calling toggleActiveStatus API...');
        try {
            const response = await api.post('/driver/toggle-active');
            console.log('toggleActiveStatus API response:', response);
            return response;
        } catch (error) {
            console.error('toggleActiveStatus API error:', error);
            console.error('Error response:', error.response);
            console.error('Error message:', error.message);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            throw error;
        }
    },

    // Deliveries
    getDeliveries: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return await api.get(`/driver/deliveries?${queryParams}`);
    },

    getNearbyDeliveries: async (limit = 10) => {
        return await api.get(`/driver/deliveries/nearby?limit=${limit}`);
    },

    updateDeliveryStatus: async (deliveryId, statusData) => {
        return await api.put(`/driver/deliveries/${deliveryId}/status`, statusData);
    },

    // Analytics
    getAnalytics: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return await api.get(`/driver/analytics?${queryParams}`);
    },

    // Earnings
    getEarnings: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return await api.get(`/driver/earnings?${queryParams}`);
    },
};