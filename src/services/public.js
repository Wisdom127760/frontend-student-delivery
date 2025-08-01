// services/public.js
import api from './api';

export const publicService = {
    // Track delivery by code
    trackDelivery: async (deliveryCode) => {
        return await api.get(`/delivery/track/${encodeURIComponent(deliveryCode)}`);
    },

    // Get public statistics
    getPublicStats: async () => {
        return await api.get('/delivery/public/stats');
    },
};