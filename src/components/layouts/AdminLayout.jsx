import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
import {
    ChartBarIcon,
    TruckIcon,
    UserGroupIcon,
    CogIcon,
    BellIcon,
    UserCircleIcon,
    HomeIcon,
    ChevronDownIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    const loadNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.notifications || []);
                    setUnreadCount(data.unreadCount || 0);
                }
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            // Fallback to mock notifications for demo
            setMockNotifications();
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        loadNotifications();
        // Set up real-time notifications (polling every 30 seconds)
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    const setMockNotifications = () => {
        const mockNotifications = [
            {
                id: 1,
                type: 'delivery',
                title: 'New Delivery Created',
                message: 'Delivery GRP-123456 has been created and assigned to driver',
                timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                read: false,
                icon: TruckIcon
            },
            {
                id: 2,
                type: 'driver',
                title: 'Driver Status Updated',
                message: 'Driver Mike Johnson is now online and available',
                timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                read: false,
                icon: UserGroupIcon
            },
            {
                id: 3,
                type: 'system',
                title: 'System Maintenance',
                message: 'Scheduled maintenance completed successfully',
                timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                read: true,
                icon: CogIcon
            }
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, read: true } : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/admin/notifications/mark-all-read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'delivery':
                return TruckIcon;
            case 'driver':
                return UserGroupIcon;
            case 'system':
                return CogIcon;
            case 'alert':
                return ExclamationTriangleIcon;
            default:
                return BellIcon;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'delivery':
                return 'text-blue-600 bg-blue-100';
            case 'driver':
                return 'text-green-600 bg-green-100';
            case 'system':
                return 'text-gray-600 bg-gray-100';
            case 'alert':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const diff = now - new Date(timestamp);
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Deliveries', href: '/admin/deliveries', icon: TruckIcon },
        { name: 'Drivers', href: '/admin/drivers', icon: UserGroupIcon },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
        { name: 'Earnings', href: '/admin/earnings', icon: CurrencyDollarIcon },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Updated isActive logic for better path matching
    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg">
                            <TruckIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="ml-3 text-xl font-bold text-gray-900">Admin Panel</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 mt-8 px-4 overflow-y-auto">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${active
                                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-600 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 transition-colors ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                                        }`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 lg:ml-0">
                {/* Top Navigation */}
                <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Notifications */}
                        <NotificationBell />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center space-x-2 sm:space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-md">
                                    <span className="text-xs sm:text-sm font-semibold text-white">
                                        {user?.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* User Dropdown Menu */}
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate('/admin/profile');
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <UserCircleIcon className="mr-3 h-4 w-4" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                navigate('/admin/settings');
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Cog6ToothIcon className="mr-3 h-4 w-4" />
                                            Settings
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Click outside to close user menu */}
            {userMenuOpen && (
                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
            )}

            {/* Click outside to close notifications */}
            {notificationsOpen && (
                <div className="fixed inset-0 z-30" onClick={() => setNotificationsOpen(false)} />
            )}
        </div>
    );
};

export default AdminLayout; 