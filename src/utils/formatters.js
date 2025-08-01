// utils/formatters.js
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// Currency formatter for Turkish Lira
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₺0';
    return `₺${Number(amount).toLocaleString('tr-TR')}`;
};

// Format delivery code
export const formatDeliveryCode = (code) => {
    if (!code) return '';
    return code.startsWith('#') ? code : `#${code}`;
};

// Format phone number
export const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Turkish phone number format: +90 555 123 45 67
    if (cleaned.length === 13 && cleaned.startsWith('90')) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }

    // Domestic format: 0555 123 45 67
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
    }

    return phone;
};

// Format date
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatString);
    } catch (error) {
        console.error('Date formatting error:', error);
        return '';
    }
};

// Format date and time
export const formatDateTime = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'MMM dd, yyyy HH:mm');
    } catch (error) {
        console.error('DateTime formatting error:', error);
        return '';
    }
};

// Format time only
export const formatTime = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, 'HH:mm');
    } catch (error) {
        console.error('Time formatting error:', error);
        return '';
    }
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;

        if (isToday(dateObj)) {
            return `Today at ${format(dateObj, 'HH:mm')}`;
        }

        if (isYesterday(dateObj)) {
            return `Yesterday at ${format(dateObj, 'HH:mm')}`;
        }

        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
        console.error('Relative time formatting error:', error);
        return '';
    }
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
};

// Format file size
export const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
};

// Format status text
export const formatStatusText = (status) => {
    if (!status) return '';
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Format delivery time estimate
export const formatDeliveryTime = (estimatedTime) => {
    if (!estimatedTime) return 'No estimate';

    try {
        const dateObj = typeof estimatedTime === 'string' ? parseISO(estimatedTime) : estimatedTime;
        const now = new Date();

        if (dateObj < now) {
            return 'Overdue';
        }

        const diffInMinutes = Math.round((dateObj - now) / (1000 * 60));

        if (diffInMinutes < 60) {
            return `${diffInMinutes} min`;
        }

        const diffInHours = Math.round(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours}h`;
        }

        const diffInDays = Math.round(diffInHours / 24);
        return `${diffInDays}d`;
    } catch (error) {
        console.error('Delivery time formatting error:', error);
        return 'Invalid time';
    }
};

// Format user initials for avatar
export const formatInitials = (name) => {
    if (!name) return '?';

    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Format distance
export const formatDistance = (distance) => {
    if (!distance) return '';

    if (distance < 1000) {
        return `${Math.round(distance)}m`;
    }

    return `${(distance / 1000).toFixed(1)}km`;
};

// Format duration in minutes
export const formatDuration = (minutes) => {
    if (!minutes) return '0 min';

    if (minutes < 60) {
        return `${Math.round(minutes)} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    if (remainingMinutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
};