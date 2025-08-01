import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { driverService } from '../../services/driver';
import { toast } from 'react-hot-toast';
import {
    WifiIcon,
    SignalSlashIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const StatusToggle = () => {
    const { user } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastLogin, setLastLogin] = useState(null);

    useEffect(() => {
        if (user) {
            // Load current status from user data
            setIsActive(user.isActive || false);
            setLastLogin(user.lastLogin);
        }
    }, [user]);

    const handleToggleStatus = async () => {
        if (!user) return;

        try {
            setLoading(true);
            console.log('Toggling driver active status...');
            const response = await driverService.toggleActiveStatus();
            console.log('Toggle response:', response);

            if (response.success) {
                const newStatus = !isActive;
                setIsActive(newStatus);
                setLastLogin(new Date().toISOString());

                toast.success(`You are now ${newStatus ? 'active' : 'inactive'}`);
                console.log('Active status updated successfully:', newStatus);

                // Update user context
                // Note: In a real app, you'd want to update the user context here
            } else {
                console.error('Toggle failed:', response.error);
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const formatLastLogin = (lastLogin) => {
        if (!lastLogin) return 'Never';

        const now = new Date();
        const loginTime = new Date(lastLogin);
        const diffInMinutes = Math.floor((now - loginTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    if (!user) return null;

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {isActive ? (
                            <WifiIcon className="h-4 w-4 text-green-600" />
                        ) : (
                            <SignalSlashIcon className="h-4 w-4 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            {isActive ? 'Active' : 'Inactive'}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            <span>Last login: {formatLastLogin(lastLogin)}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleToggleStatus}
                    disabled={loading}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isActive
                        ? 'bg-green-600 focus:ring-green-500 shadow-md'
                        : 'bg-gray-300 focus:ring-gray-400 shadow-sm'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}`}
                >
                    <span
                        className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-all duration-300 ${isActive ? 'translate-x-10' : 'translate-x-1'
                            }`}
                    />

                    {/* ON/OFF Labels */}
                    <span className={`absolute left-2 text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                        OFF
                    </span>
                    <span className={`absolute right-2 text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                        ON
                    </span>

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        </div>
                    )}
                </button>
            </div>

            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                    {isActive
                        ? 'You are currently active and available for deliveries. You will receive notifications for new assignments.'
                        : 'You are currently inactive. Go active to receive delivery assignments and notifications.'
                    }
                </p>
            </div>
        </div>
    );
};

export default StatusToggle; 