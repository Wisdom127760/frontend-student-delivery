// services/notification.js
import api from './api';

export const notificationService = {
    // Get notifications with pagination
    getNotifications: async (page = 1, limit = 20) => {
        const queryParams = new URLSearchParams({ page, limit }).toString();
        return await api.get(`/notifications?${queryParams}`);
    },

    // Get unread count
    getUnreadCount: async () => {
        return await api.get('/notifications/unread-count');
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        return await api.put(`/notifications/${notificationId}/read`);
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        return await api.put('/notifications/mark-all-read');
    },

    // Delete notification (admin only)
    deleteNotification: async (notificationId) => {
        return await api.delete(`/notifications/${notificationId}`);
    },

    // Create system notification (admin only)
    createSystemNotification: async (data) => {
        return await api.post('/notifications/system', data);
    },

    // Get notification statistics (admin only)
    getNotificationStats: async () => {
        return await api.get('/notifications/stats');
    }
}; 