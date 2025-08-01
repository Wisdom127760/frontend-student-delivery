import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
    BellIcon,
    CheckIcon,
    EyeIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
    const { notifications, loading, hasMore, loadMore, markAsRead, markAllAsRead } = useNotifications();
    const [filter, setFilter] = useState('all');

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);
            toast.success('Notification marked as read');
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all notifications as read');
        }
    };

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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'delivery_assigned':
                return 'bg-green-100 text-green-800';
            case 'delivery_picked_up':
                return 'bg-blue-100 text-blue-800';
            case 'delivery_delivered':
                return 'bg-purple-100 text-purple-800';
            case 'payment_received':
                return 'bg-yellow-100 text-yellow-800';
            case 'account_suspended':
                return 'bg-red-100 text-red-800';
            case 'system_alert':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return notification.type === filter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Notifications</h1>
                    <p className="text-gray-600">View and manage your notifications</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Mark All Read
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${filter === 'all'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${filter === 'unread'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Unread
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${filter === 'read'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Read
                    </button>
                    <button
                        onClick={() => setFilter('delivery_assigned')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${filter === 'delivery_assigned'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Delivery Assigned
                    </button>
                    <button
                        onClick={() => setFilter('payment_received')}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${filter === 'payment_received'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Payments
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Notifications ({filteredNotifications.length})
                    </h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Loading notifications...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No notifications found
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-6 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 text-3xl">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <h3 className={`text-lg font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'
                                                    }`}>
                                                    {notification.title}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                                    {notification.priority}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                                                    {notification.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-400">
                                                    {notification.timeAgo}
                                                </span>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification._id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Mark as read"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {notification.message}
                                        </p>
                                        {notification.data && Object.keys(notification.data).length > 0 && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Details:</p>
                                                {notification.data.deliveryCode && (
                                                    <p className="text-sm text-gray-700">
                                                        <strong>Delivery Code:</strong> {notification.data.deliveryCode}
                                                    </p>
                                                )}
                                                {notification.data.pickupLocation && (
                                                    <p className="text-sm text-gray-700">
                                                        <strong>Pickup:</strong> {notification.data.pickupLocation}
                                                    </p>
                                                )}
                                                {notification.data.deliveryLocation && (
                                                    <p className="text-sm text-gray-700">
                                                        <strong>Delivery:</strong> {notification.data.deliveryLocation}
                                                    </p>
                                                )}
                                                {notification.data.fee && (
                                                    <p className="text-sm text-gray-700">
                                                        <strong>Fee:</strong> ₺{notification.data.fee}
                                                    </p>
                                                )}
                                                {notification.data.amount && (
                                                    <p className="text-sm text-gray-700">
                                                        <strong>Amount:</strong> ₺{notification.data.amount}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Load More Button */}
                {hasMore && (
                    <div className="p-6 border-t border-gray-200">
                        <button
                            onClick={loadMore}
                            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage; 