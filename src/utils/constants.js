// utils/constants.js

export const USER_TYPES = {
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    DRIVER: 'driver',
};

export const DELIVERY_STATUS = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    PICKED_UP: 'picked_up',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
};

export const DELIVERY_STATUS_LABELS = {
    [DELIVERY_STATUS.PENDING]: 'Pending',
    [DELIVERY_STATUS.ASSIGNED]: 'Assigned',
    [DELIVERY_STATUS.PICKED_UP]: 'Picked Up',
    [DELIVERY_STATUS.DELIVERED]: 'Delivered',
    [DELIVERY_STATUS.CANCELLED]: 'Cancelled',
};

export const DELIVERY_STATUS_COLORS = {
    [DELIVERY_STATUS.PENDING]: 'gray',
    [DELIVERY_STATUS.ASSIGNED]: 'blue',
    [DELIVERY_STATUS.PICKED_UP]: 'yellow',
    [DELIVERY_STATUS.DELIVERED]: 'green',
    [DELIVERY_STATUS.CANCELLED]: 'red',
};

export const PAYMENT_METHODS = {
    CASH: 'cash',
    CARD: 'card',
    TRANSFER: 'transfer',
};

export const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.CASH]: 'Cash',
    [PAYMENT_METHODS.CARD]: 'Card',
    [PAYMENT_METHODS.TRANSFER]: 'Transfer',
};

export const AREAS = [
    'Gonyeli',
    'Kucuk',
    'Lefkosa',
    'Famagusta',
    'Kyrenia',
    'Other',
];

export const ADMIN_PERMISSIONS = {
    CREATE_DELIVERY: 'create_delivery',
    EDIT_DELIVERY: 'edit_delivery',
    DELETE_DELIVERY: 'delete_delivery',
    MANAGE_DRIVERS: 'manage_drivers',
    VIEW_ANALYTICS: 'view_analytics',
};

export const PERIODS = {
    TODAY: 'today',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
};

export const PERIOD_LABELS = {
    [PERIODS.TODAY]: 'Today',
    [PERIODS.WEEK]: 'This Week',
    [PERIODS.MONTH]: 'This Month',
    [PERIODS.YEAR]: 'This Year',
};

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
};

export const DELIVERY_FEES = {
    DEFAULT_FEE: 150,
    DRIVER_EARNING: 100,
    COMPANY_EARNING: 50,
    REMISSION_PER_DELIVERY: 50,
};

export const API_ENDPOINTS = {
    // Auth
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',

    // Admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_DELIVERIES: '/admin/deliveries',
    ADMIN_DRIVERS: '/admin/drivers',
    ADMIN_ANALYTICS: '/admin/analytics',

    // Driver
    DRIVER_PROFILE: '/driver/profile',
    DRIVER_DELIVERIES: '/driver/deliveries',
    DRIVER_ANALYTICS: '/driver/analytics',
    DRIVER_EARNINGS: '/driver/earnings',

    // Public
    TRACK_DELIVERY: '/delivery/track',
    PUBLIC_STATS: '/delivery/public/stats',
};

export const ROUTE_PATHS = {
    // Auth
    LOGIN: '/login',

    // Admin
    ADMIN_DASHBOARD: '/admin',
    ADMIN_DELIVERIES: '/admin/deliveries',
    ADMIN_DRIVERS: '/admin/drivers',
    ADMIN_ANALYTICS: '/admin/analytics',

    // Driver
    DRIVER_DASHBOARD: '/driver',
    DRIVER_DELIVERIES: '/driver/deliveries',
    DRIVER_PROFILE: '/driver/profile',
    DRIVER_EARNINGS: '/driver/earnings',

    // Public
    TRACK_DELIVERY: '/track',
};

export const LOCAL_STORAGE_KEYS = {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme',
    SIDEBAR_COLLAPSED: 'sidebarCollapsed',
};

export const TOAST_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logged out successfully',
    OTP_SENT: 'OTP sent to your email',
    INVALID_OTP: 'Invalid or expired OTP',
    DELIVERY_CREATED: 'Delivery created successfully',
    DELIVERY_UPDATED: 'Delivery updated successfully',
    DELIVERY_DELETED: 'Delivery deleted successfully',
    DRIVER_ADDED: 'Driver added successfully',
    DRIVER_UPDATED: 'Driver updated successfully',
    DRIVER_DELETED: 'Driver removed successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    STATUS_UPDATED: 'Status updated successfully',
    PERMISSION_DENIED: 'You do not have permission to perform this action',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
};