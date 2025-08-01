import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
    ChartBarIcon,
    CurrencyDollarIcon,
    TruckIcon,
    UserGroupIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    StarIcon
} from '@heroicons/react/24/outline';

const AnalyticsPage = () => {
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/analytics?period=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAnalytics(data.data);
                } else {
                    setError(data.error || 'Failed to load analytics');
                    toast.error(data.error || 'Failed to load analytics');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to load analytics');
                toast.error(errorData.error || 'Failed to load analytics');
            }
        } catch (error) {
            console.error('Error loading analytics:', error);
            setError('Network error. Please try again.');
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ChartBarIcon className="h-16 w-16 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadAnalytics}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                    >
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">Comprehensive insights and performance metrics</p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                    </select>
                    <button
                        onClick={loadAnalytics}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₺{analytics.overview?.revenue?.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">
                            +{analytics.overview?.revenueChange}% from last period
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <TruckIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                            <p className="text-2xl font-bold text-gray-900">{analytics.overview?.deliveries}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">
                            +{analytics.overview?.deliveriesChange}% from last period
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <UserGroupIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Active Drivers</p>
                            <p className="text-2xl font-bold text-gray-900">{analytics.overview?.drivers}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">
                            +{analytics.overview?.driversChange}% from last period
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <StarIcon className="h-8 w-8 text-primary-600" />
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-500">Avg Rating</p>
                            <p className="text-2xl font-bold text-gray-900">{analytics.overview?.rating}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">
                            +{analytics.overview?.ratingChange} from last period
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts and Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
                        <p className="text-sm text-gray-500">Monthly revenue performance</p>
                    </div>
                    <div className="p-6">
                        <div className="flex items-end justify-between h-48">
                            {analytics.revenueData?.map((data, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div
                                        className="w-full bg-primary-500 rounded-t"
                                        style={{
                                            height: `${(data.revenue / Math.max(...analytics.revenueData.map(d => d.revenue))) * 200}px`
                                        }}
                                    ></div>
                                    <div className="mt-2 text-xs text-gray-500">{data.month}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-500">Revenue in USD</p>
                        </div>
                    </div>
                </div>

                {/* Delivery Status */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Delivery Status</h3>
                        <p className="text-sm text-gray-500">Current delivery breakdown</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {analytics.deliveryStatus?.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${item.status === 'Completed' ? 'bg-green-500' :
                                            item.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'
                                            }`}></div>
                                        <span className="text-sm font-medium text-gray-900">{item.status}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                                        <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Areas and Driver Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Delivery Areas */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Top Delivery Areas</h3>
                        <p className="text-sm text-gray-500">Most active delivery zones</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {analytics.topAreas?.map((area, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <MapPinIcon className="w-4 h-4 text-gray-400 mr-3" />
                                        <span className="text-sm font-medium text-gray-900">{area.area}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{area.deliveries} deliveries</div>
                                        <div className="text-sm text-gray-500">${area.revenue.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Driver Performance */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Top Driver Performance</h3>
                        <p className="text-sm text-gray-500">Best performing drivers this month</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {analytics.driverPerformance?.map((driver, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                                            <span className="text-xs font-medium text-primary-700">
                                                {driver.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                                            <div className="text-xs text-gray-500">⭐ {driver.rating}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{driver.deliveries} deliveries</div>
                                        <div className="text-sm text-gray-500">${driver.earnings}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
