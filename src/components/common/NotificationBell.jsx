import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
    BellIcon,
    CheckIcon,
    TrashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

const NotificationBell = () => {
    const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        setIsOpen(false);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
        setIsOpen(false);
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
                return 'border-red-500 bg-red-50';
            case 'high':
                return 'border-orange-500 bg-orange-50';
            case 'medium':
                return 'border-blue-500 bg-blue-50';
            case 'low':
                return 'border-gray-500 bg-gray-50';
            default:
                return 'border-blue-500 bg-blue-50';
        }
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {notifications.slice(0, 10).map((notification) => (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 text-2xl">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'
                                                        }`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-xs text-gray-400">
                                                        {notification.timeAgo}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                                    {notification.priority}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default NotificationBell; 