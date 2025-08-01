import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Try to import from Heroicons, fallback to custom icons
let icons;
try {
    icons = require('@heroicons/react/24/outline');
} catch (error) {
    icons = require('../../components/common/Icons');
}

const {
    TruckIcon,
    MapPinIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon,
    StarIcon,
    PhoneIcon,
    ChartBarIcon
} = icons;

const DriverDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        todayDeliveries: 0,
        completed: 0,
        pending: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalDeliveries: 0
    });

    const [currentDeliveries, setCurrentDeliveries] = useState([]);
    const [recentEarnings, setRecentEarnings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    const loadDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Fetch driver analytics
            const analyticsResponse = await fetch(`${API_BASE_URL}/driver/analytics?period=month`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Analytics response status:', analyticsResponse.status);

            if (analyticsResponse.ok) {
                const analyticsData = await analyticsResponse.json();
                console.log('Analytics data:', analyticsData);

                if (analyticsData.success) {
                    const analytics = analyticsData.data;

                    // Get today's date for filtering
                    const today = new Date();
                    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

                    // Fetch today's deliveries for accurate today count
                    const todayDeliveriesResponse = await fetch(`${API_BASE_URL}/driver/deliveries?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    let todayDeliveries = 0;
                    if (todayDeliveriesResponse.ok) {
                        const todayData = await todayDeliveriesResponse.json();
                        if (todayData.success) {
                            todayDeliveries = todayData.data.deliveries?.length || 0;
                        }
                    }

                    // Fetch pending deliveries
                    const pendingResponse = await fetch(`${API_BASE_URL}/driver/deliveries?status=pending`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    let pendingDeliveries = 0;
                    if (pendingResponse.ok) {
                        const pendingData = await pendingResponse.json();
                        if (pendingData.success) {
                            pendingDeliveries = pendingData.data.deliveries?.length || 0;
                        }
                    }

                    // Fetch driver profile to get rating and other stats
                    const profileResponse = await fetch(`${API_BASE_URL}/driver/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    let driverRating = 5.0;
                    let driverTotalDeliveries = 0;
                    let driverTotalEarnings = 0;

                    if (profileResponse.ok) {
                        const profileData = await profileResponse.json();
                        console.log('Profile data:', profileData);
                        if (profileData.success) {
                            const driver = profileData.data;
                            driverRating = driver.rating || 5.0;
                            driverTotalDeliveries = driver.totalDeliveries || 0;
                            driverTotalEarnings = driver.totalEarnings || 0;
                        }
                    } else {
                        console.error('Profile response not ok:', profileResponse.status, profileResponse.statusText);
                    }

                    setStats({
                        todayDeliveries: todayDeliveries,
                        completed: analytics.stats?.totalDeliveries || 0,
                        pending: pendingDeliveries,
                        totalEarnings: driverTotalEarnings,
                        averageRating: driverRating,
                        totalDeliveries: driverTotalDeliveries
                    });

                    // Fetch earnings data
                    const earningsResponse = await fetch(`${API_BASE_URL}/driver/earnings?period=month`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (earningsResponse.ok) {
                        const earningsData = await earningsResponse.json();
                        console.log('Earnings data:', earningsData);
                        if (earningsData.success) {
                            const earnings = earningsData.data.earnings || [];
                            const recentEarningsData = earnings.slice(0, 7).map(week => ({
                                id: week.week,
                                date: new Date(week.week).toLocaleDateString(),
                                deliveries: week.deliveries,
                                earnings: week.earnings,
                                tips: 0, // Backend doesn't provide tips yet
                                total: week.earnings
                            }));
                            setRecentEarnings(recentEarningsData);
                        }
                    } else {
                        console.error('Earnings response not ok:', earningsResponse.status, earningsResponse.statusText);
                        // Fallback to analytics daily stats if earnings endpoint fails
                        if (analytics.dailyStats) {
                            const earnings = analytics.dailyStats.slice(0, 7).map(day => ({
                                id: day.date,
                                date: new Date(day.date).toLocaleDateString(),
                                deliveries: day.deliveries,
                                earnings: day.earnings,
                                tips: 0, // Backend doesn't provide tips yet
                                total: day.earnings
                            }));
                            setRecentEarnings(earnings);
                        }
                    }
                }
            } else {
                console.error('Analytics response not ok:', analyticsResponse.status, analyticsResponse.statusText);
            }

            // Fetch current deliveries
            console.log('Fetching driver deliveries...');
            const deliveriesResponse = await fetch(`${API_BASE_URL}/driver/deliveries?status=assigned&limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Deliveries response status:', deliveriesResponse.status);

            if (deliveriesResponse.ok) {
                const deliveriesData = await deliveriesResponse.json();
                console.log('Deliveries data:', deliveriesData);

                if (deliveriesData.success) {
                    const deliveries = deliveriesData.data.deliveries || [];
                    console.log('Processed deliveries:', deliveries);

                    setCurrentDeliveries(deliveries.map(delivery => ({
                        id: delivery._id,
                        deliveryCode: delivery.deliveryCode,
                        customerName: delivery.customerName || 'N/A',
                        customerPhone: delivery.customerPhone || 'N/A',
                        pickupAddress: delivery.pickupLocation,
                        deliveryAddress: delivery.deliveryLocation,
                        amount: delivery.fee,
                        status: delivery.status,
                        estimatedTime: delivery.estimatedTime ? new Date(delivery.estimatedTime).toLocaleTimeString() : 'N/A'
                    })));
                } else {
                    console.error('Deliveries API error:', deliveriesData.error);
                }
            } else {
                console.error('Deliveries response not ok:', deliveriesResponse.status, deliveriesResponse.statusText);
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        } finally {
            setIsLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'text-green-600 bg-green-100';
            case 'picked_up':
                return 'text-primary-600 bg-primary-100';
            case 'assigned':
                return 'text-primary-600 bg-primary-100';
            case 'pending':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return CheckCircleIcon;
            case 'picked_up':
                return ClockIcon;
            case 'assigned':
                return ExclamationTriangleIcon;
            default:
                return ClockIcon;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Driver Dashboard</h1>
                    <p className="text-gray-600">Welcome back! Here's your delivery overview.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={() => navigate('/driver/deliveries')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                    >
                        <TruckIcon className="w-4 h-4 mr-2" />
                        View All Deliveries
                    </button>
                    <button
                        onClick={() => navigate('/driver/earnings')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        <ChartBarIcon className="w-4 h-4 mr-2" />
                        View Earnings
                    </button>
                </div>
            </div>



            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TruckIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Today's Deliveries</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.todayDeliveries}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                            <p className="text-2xl font-bold text-gray-900">₺{stats.totalEarnings}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <StarIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Average Rating</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ChartBarIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Deliveries */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Current Deliveries</h3>
                            <button
                                onClick={() => navigate('/driver/deliveries')}
                                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                            >
                                View all
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {currentDeliveries.map((delivery) => {
                                const StatusIcon = getStatusIcon(delivery.status);
                                return (
                                    <div key={delivery.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <TruckIcon className="w-5 h-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{delivery.customerName}</p>
                                                <p className="text-sm text-gray-500">{delivery.deliveryCode}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {delivery.status.replace('_', ' ')}
                                            </span>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">₺{delivery.amount}</p>
                                                <p className="text-xs text-gray-500">{delivery.estimatedTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {currentDeliveries.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No current deliveries
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Earnings */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Recent Earnings</h3>
                            <button
                                onClick={() => navigate('/driver/earnings')}
                                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                            >
                                View all
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentEarnings.map((earning) => (
                                <div key={earning.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{earning.date}</p>
                                            <p className="text-sm text-gray-500">{earning.deliveries} deliveries</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">₺{earning.total}</p>
                                        <p className="text-xs text-gray-500">₺{earning.earnings} + ₺{earning.tips} tips</p>
                                    </div>
                                </div>
                            ))}
                            {recentEarnings.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No recent earnings data
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <TruckIcon className="w-5 h-5 mr-2" />
                        Start Delivery
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <MapPinIcon className="w-5 h-5 mr-2" />
                        View Route
                    </button>
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <PhoneIcon className="w-5 h-5 mr-2" />
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;