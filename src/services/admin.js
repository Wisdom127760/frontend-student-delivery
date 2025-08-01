// services/admin.js
import api from './api';

export const adminService = {
    // Dashboard
    getDashboard: async (period = 'month') => {
        return await api.get(`/admin/dashboard?period=${period}`);
    },

    // Deliveries
    getDeliveries: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return await api.get(`/admin/deliveries?${queryParams}`);
    },

    createDelivery: async (deliveryData) => {
        return await api.post('/admin/deliveries', deliveryData);
    },

    updateDelivery: async (id, deliveryData) => {
        return await api.put(`/admin/deliveries/${id}`, deliveryData);
    },

    deleteDelivery: async (id) => {
        return await api.delete(`/admin/deliveries/${id}`);
    },

    assignDelivery: async (id, driverId, notes = '') => {
        return await api.post(`/admin/deliveries/${id}/assign`, { driverId, notes });
    },

    bulkDeliveries: async (operation, ids, data = {}) => {
        return await api.post('/admin/deliveries/bulk', { operation, ids, data });
    },

    // Drivers
    getDrivers: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return await api.get(`/admin/drivers?${queryParams}`);
    },

    createDriver: async (driverData) => {
        return await api.post('/admin/drivers', driverData);
    },

    updateDriver: async (id, driverData) => {
        return await api.put(`/admin/drivers/${id}`, driverData);
    },

    deleteDriver: async (id) => {
        return await api.delete(`/admin/drivers/${id}`);
    },

    getDriverAnalytics: async (driverId, params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return await api.get(`/admin/drivers/${driverId}/analytics?${queryParams}`);
    },

    // Analytics
    getAnalytics: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        return await api.get(`/admin/analytics?${queryParams}`);
    },
};