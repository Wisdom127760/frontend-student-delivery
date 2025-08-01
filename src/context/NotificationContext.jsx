import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notification';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // Load initial notifications
    const loadNotifications = useCallback(async (page = 1, append = false) => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await notificationService.getNotifications(page);

            if (response.success) {
                const newNotifications = response.data.notifications || [];

                if (append) {
                    setNotifications(prev => [...prev, ...newNotifications]);
                } else {
                    setNotifications(newNotifications);
                }

                setHasMore(response.data.totalPages > page);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Load unread count
    const loadUnreadCount = useCallback(async () => {
        if (!user) return;

        try {
            const response = await notificationService.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    }, [user]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const response = await notificationService.markAsRead(notificationId);
            if (response.success) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification._id === notificationId
                            ? { ...notification, isRead: true, readAt: new Date() }
                            : notification
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            const response = await notificationService.markAllAsRead();
            if (response.success) {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);

    // Add new notification
    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.isRead) {
            setUnreadCount(prev => prev + 1);

            // Show toast notification
            toast.success(notification.message, {
                duration: 5000,
                position: 'top-right',
                icon: getNotificationIcon(notification.type),
                style: {
                    background: getNotificationColor(notification.priority),
                    color: 'white'
                }
            });
        }
    }, []);

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'delivery_assigned':
                return '🚚';
            case 'delivery_picked_up':
                return '📦';
            case 'delivery_delivered':
                return '✅';
            case 'payment_received':
                return '💰';
            case 'account_suspended':
                return '⚠️';
            case 'system_alert':
                return '🔔';
            default:
                return '📢';
        }
    };

    // Get notification color based on priority
    const getNotificationColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return '#ef4444';
            case 'high':
                return '#f59e0b';
            case 'medium':
                return '#3b82f6';
            case 'low':
                return '#6b7280';
            default:
                return '#3b82f6';
        }
    };

    // Load more notifications
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadNotifications(currentPage + 1, true);
        }
    }, [loading, hasMore, currentPage, loadNotifications]);

    // Socket event listeners
    useEffect(() => {
        if (!user) return;

        // Try to connect socket if not connected
        if (!socketService.getConnectionStatus()) {
            console.log('Socket not connected, attempting to connect...');
            socketService.connect(user.id, user.userType);
        }

        // Listen for new notifications
        socketService.on('new-notification', (notification) => {
            addNotification(notification);
        });

        // Listen for notification updates
        socketService.on('notification-updated', (updatedNotification) => {
            setNotifications(prev =>
                prev.map(notification =>
                    notification._id === updatedNotification._id
                        ? updatedNotification
                        : notification
                )
            );
        });

        return () => {
            socketService.off('new-notification');
            socketService.off('notification-updated');
        };
    }, [user, addNotification]);

    // Load initial data
    useEffect(() => {
        if (user) {
            loadNotifications(1);
            loadUnreadCount();
        }
    }, [user, loadNotifications, loadUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        loading,
        hasMore,
        loadNotifications,
        loadUnreadCount,
        markAsRead,
        markAllAsRead,
        loadMore,
        addNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 