import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../services/socketService';
import { toast } from 'react-hot-toast';
import {
    UserGroupIcon,
    WifiIcon,
    SignalSlashIcon,
    ClockIcon,
    MapPinIcon,
    ArrowPathIcon,
    TruckIcon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const RealTimeDriverStatus = () => {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [offlineCount, setOfflineCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [nextRefresh, setNextRefresh] = useState(null);
    const [selectedArea, setSelectedArea] = useState('all');
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverDeliveries, setDriverDeliveries] = useState({});

    const updateCounts = (driverList) => {
        const active = driverList.filter(driver => driver.isActive).length;
        const inactive = driverList.filter(driver => !driver.isActive).length;
        setOnlineCount(active);
        setOfflineCount(inactive);
    };

    const loadDrivers = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/admin/drivers?limit=50`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setDrivers(data.data);
                    updateCounts(data.data);
                    setLastRefresh(new Date());
                    setNextRefresh(new Date(Date.now() + 300000)); // Changed from 60 seconds to 5 minutes
                }
            }
        } catch (error) {
            console.error('Error loading drivers:', error);
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDriverStatusUpdate = useCallback((data) => {
        console.log('Received driver status update:', data);

        setDrivers(prevDrivers => {
            const updatedDrivers = prevDrivers.map(driver => {
                if (driver._id === data.driverId) {
                    return {
                        ...driver,
                        isOnline: data.isOnline,
                        isActive: data.isActive,
                        lastLogin: data.lastLogin
                    };
                }
                return driver;
            });

            updateCounts(updatedDrivers);

            const updatedDriver = updatedDrivers.find(d => d._id === data.driverId);
            if (updatedDriver) {
                const statusText = data.isActive ? 'active' : 'inactive';
                toast.success(`${updatedDriver.name} is now ${statusText}`);
            }

            return updatedDrivers;
        });
    }, []);

    useEffect(() => {
        if (!user || user.userType !== 'admin') return;

        console.log('Setting up admin socket listener for driver status updates');
        console.log('Socket connection status:', socketService.getConnectionStatus());
        loadDrivers();
        socketService.on('driver-status-changed', handleDriverStatusUpdate);

        // Test socket connection
        setTimeout(() => {
            console.log('Testing socket connection...');
            socketService.emit('test', { message: 'Admin panel is connected' });
        }, 2000);

        const refreshInterval = setInterval(() => {
            console.log('Auto-refreshing driver status...');
            loadDrivers();
        }, 300000); // Changed from 60 seconds to 5 minutes

        return () => {
            console.log('Cleaning up admin socket listener');
            socketService.off('driver-status-changed', handleDriverStatusUpdate);
            clearInterval(refreshInterval);
        };
    }, [user, loadDrivers, handleDriverStatusUpdate]);

    const loadDriverDeliveries = useCallback(async (driverId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/admin/deliveries?assignedTo=${driverId}&status=pending,assigned,picked_up&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setDriverDeliveries(prev => ({
                        ...prev,
                        [driverId]: data.data.deliveries || []
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading driver deliveries:', error);
        }
    }, []);

    const handleDriverClick = async (driver) => {
        setSelectedDriver(driver);
        await loadDriverDeliveries(driver._id);
        setShowDeliveryModal(true);
    };

    const getDriverAvailability = (driver) => {
        const currentDeliveries = driverDeliveries[driver._id] || [];
        const hasActiveDelivery = currentDeliveries.some(delivery =>
            ['assigned', 'picked_up'].includes(delivery.status)
        );

        if (!driver.isActive) return 'offline';
        if (!driver.isOnline) return 'offline';
        if (hasActiveDelivery) return 'busy';
        return 'available';
    };

    const getAvailabilityColor = (availability) => {
        switch (availability) {
            case 'available': return 'text-green-600 bg-green-100';
            case 'busy': return 'text-orange-600 bg-orange-100';
            case 'offline': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getAvailabilityText = (availability) => {
        switch (availability) {
            case 'available': return 'Available';
            case 'busy': return 'Busy';
            case 'offline': return 'Offline';
            default: return 'Unknown';
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

    const getStatusColor = (isActive) => {
        return isActive ? 'text-green-600' : 'text-gray-400';
    };

    const getStatusIcon = (isActive) => {
        return isActive ? WifiIcon : SignalSlashIcon;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const filteredDrivers = drivers.filter(driver =>
        selectedArea === 'all' || driver.area === selectedArea
    );

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <UserGroupIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Real-Time Driver Status</h3>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-green-600">
                        <WifiIcon className="h-4 w-4 mr-1" />
                        <span>{onlineCount} Active</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                        <SignalSlashIcon className="h-4 w-4 mr-1" />
                        <span>{offlineCount} Inactive</span>
                    </div>
                    <button
                        onClick={loadDrivers}
                        disabled={loading}
                        className="flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowPathIcon className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Location Filter */}
            <div className="mb-4">
                <label htmlFor="area-filter" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Location
                </label>
                <select
                    id="area-filter"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                    <option value="all">All Locations</option>
                    <option value="Gonyeli">Gonyeli</option>
                    <option value="Kucuk">Kucuk</option>
                    <option value="Lefkosa">Lefkosa</option>
                    <option value="Famagusta">Famagusta</option>
                    <option value="Kyrenia">Kyrenia</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredDrivers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No drivers found</p>
                    </div>
                ) : (
                    filteredDrivers.map(driver => {
                        const StatusIcon = getStatusIcon(driver.isActive);
                        const availability = getDriverAvailability(driver);
                        return (
                            <div
                                key={driver._id}
                                onClick={() => handleDriverClick(driver)}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${driver.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <span className="text-sm font-semibold text-gray-700">
                                            {driver.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-medium text-gray-900">{driver.name}</h4>
                                            <StatusIcon className={`h-4 w-4 ${getStatusColor(driver.isActive)}`} />
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(availability)}`}>
                                                {getAvailabilityText(availability)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            <div className="flex items-center">
                                                <MapPinIcon className="h-3 w-3 mr-1" />
                                                <span>{driver.area}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                <span>{formatLastLogin(driver.lastLogin)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <TruckIcon className="h-3 w-3 mr-1" />
                                                <span>{driver.completedDeliveries} completed</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        ₺{driver.totalEarnings}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Rating: {driver.rating}/5
                                    </div>
                                    {availability === 'available' && (
                                        <div className="mt-1">
                                            <button className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200">
                                                <PlusIcon className="h-3 w-3 mr-1" />
                                                Assign Delivery
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Total Drivers: {filteredDrivers.length}</span>
                    <div className="flex items-center space-x-4">
                        {lastRefresh && (
                            <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
                        )}
                        {nextRefresh && (
                            <span>Next refresh: {nextRefresh.toLocaleTimeString()}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Delivery Assignment Modal */}
            {showDeliveryModal && selectedDriver && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Assign Delivery to {selectedDriver.name}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDeliveryModal(false);
                                        setSelectedDriver(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Driver Info</h4>
                                    <div className="text-sm text-gray-600">
                                        <p><strong>Name:</strong> {selectedDriver.name}</p>
                                        <p><strong>Area:</strong> {selectedDriver.area}</p>
                                        <p><strong>Status:</strong> {getAvailabilityText(getDriverAvailability(selectedDriver))}</p>
                                        <p><strong>Completed Deliveries:</strong> {selectedDriver.completedDeliveries}</p>
                                        <p><strong>Total Earnings:</strong> ₺{selectedDriver.totalEarnings}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Current Deliveries</h4>
                                {driverDeliveries[selectedDriver._id] && driverDeliveries[selectedDriver._id].length > 0 ? (
                                    <div className="space-y-2">
                                        {driverDeliveries[selectedDriver._id].map(delivery => (
                                            <div key={delivery._id} className="bg-yellow-50 p-2 rounded border">
                                                <p className="text-sm font-medium">{delivery.deliveryCode}</p>
                                                <p className="text-xs text-gray-600">{delivery.pickupLocation} → {delivery.deliveryLocation}</p>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${delivery.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                    delivery.status === 'picked_up' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {delivery.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No active deliveries</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeliveryModal(false);
                                        setSelectedDriver(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        window.location.href = `/admin/deliveries?create=true&driver=${selectedDriver._id}`;
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Create New Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RealTimeDriverStatus; 