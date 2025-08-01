import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TruckIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    PlusIcon,
    EyeIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import RealTimeDriverStatus from '../../components/admin/RealTimeDriverStatus';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({});
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [topDrivers, setTopDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        loadDashboardData();
    }, [selectedPeriod]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch dashboard data with selected period
            const dashboardResponse = await fetch(`${API_BASE_URL}/admin/dashboard?period=${selectedPeriod}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (dashboardResponse.ok) {
                const result = await dashboardResponse.json();
                if (result.success) {
                    setDashboardData(result.data.analytics?.stats || {});
                    setRecentDeliveries(result.data.recentDeliveries || []);
                    setTopDrivers(result.data.topDrivers || []);
                } else {
                    console.error('Failed to load dashboard data:', result.error);
                    toast.error('Failed to load dashboard data');
                }
            } else {
                console.error('Failed to load dashboard data:', dashboardResponse.status);
                toast.error('Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'text-green-600 bg-green-100';
            case 'picked_up': return 'text-primary-600 bg-primary-100';
            case 'assigned': return 'text-primary-600 bg-primary-100';
            case 'pending': return 'text-gray-600 bg-gray-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Welcome back! Here's what's happening {selectedPeriod === 'today' ? 'today' : selectedPeriod === 'week' ? 'this week' : selectedPeriod === 'month' ? 'this month' : selectedPeriod === 'year' ? 'this year' : 'all time'}.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    {/* Period Filter */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="period-filter" className="text-sm font-medium text-gray-700">
                            Period:
                        </label>
                        <select
                            id="period-filter"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            disabled={loading}
                            className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                            <option value="all-time">All Time</option>
                        </select>
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/admin/deliveries?create=true')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        New Delivery
                    </button>
                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        <ChartBarIcon className="w-4 h-4 mr-2" />
                        View Reports
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Drivers */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <UserGroupIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Drivers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {dashboardData.totalDrivers || 0}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 ml-1">
                                {dashboardData.activeDrivers || 0} Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Total Deliveries */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TruckIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {dashboardData.totalDeliveries || 0}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 ml-1">
                                {dashboardData.completionRate || 0}% Complete
                            </span>
                        </div>
                    </div>
                </div>

                {/* Revenue */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ₺{dashboardData.totalRevenue || 0}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 ml-1">
                                ₺{dashboardData.totalDriverEarnings || 0} Driver Earnings
                            </span>
                        </div>
                    </div>
                </div>

                {/* Active Drivers Today */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Active Today</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {dashboardData.activeDrivers || 0}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 ml-1">
                                Online Now
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Real-Time Driver Status */}
            <div className="mb-6">
                <RealTimeDriverStatus />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Deliveries */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Deliveries</h3>
                    </div>
                    <div className="p-6">
                        {recentDeliveries.length > 0 ? (
                            <div className="space-y-4">
                                {recentDeliveries.slice(0, 5).map((delivery) => (
                                    <div key={delivery._id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <TruckIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {delivery.deliveryCode}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {delivery.pickupLocation} → {delivery.deliveryLocation}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                                {delivery.status.replace('_', ' ')}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/admin/deliveries`)}
                                                className="ml-2 text-gray-400 hover:text-gray-600"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No recent deliveries</p>
                        )}
                        <div className="mt-4">
                            <button
                                onClick={() => navigate('/admin/deliveries')}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View all deliveries →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Drivers */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Top Drivers</h3>
                    </div>
                    <div className="p-6">
                        {topDrivers.length > 0 ? (
                            <div className="space-y-4">
                                {topDrivers.slice(0, 5).map((driver, index) => (
                                    <div key={driver._id} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary-600">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {driver.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {driver.totalDeliveries || 0} deliveries
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                ₺{driver.totalEarnings || 0}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {driver.area}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No driver data available</p>
                        )}
                        <div className="mt-4">
                            <button
                                onClick={() => navigate('/admin/drivers')}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View all drivers →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/admin/deliveries')}
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create Delivery
                    </button>
                    <button
                        onClick={() => navigate('/admin/drivers')}
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <UserGroupIcon className="w-5 h-5 mr-2" />
                        Manage Drivers
                    </button>
                    <button
                        onClick={() => navigate('/admin/analytics')}
                        className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <ChartBarIcon className="w-5 h-5 mr-2" />
                        View Analytics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

