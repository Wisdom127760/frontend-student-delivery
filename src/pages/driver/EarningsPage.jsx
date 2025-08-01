import React, { useState, useEffect, useCallback } from 'react';
import {
    CurrencyDollarIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    StarIcon,
    TruckIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const EarningsPage = () => {
    const [earnings, setEarnings] = useState({});
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    const loadEarnings = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/driver/earnings?period=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setEarnings(data.data);
                }
            } else {
                // Fallback to mock data if API fails
                const mockEarnings = {
                    overview: {
                        totalEarnings: 2847.50,
                        totalDeliveries: 156,
                        totalTips: 245.00,
                        averagePerDelivery: 18.25,
                        earningsChange: 12.5,
                        deliveriesChange: 8.3,
                        tipsChange: 15.2
                    },
                    weeklyData: [
                        { date: '2024-01-09', earnings: 145.50, deliveries: 8, tips: 12.00 },
                        { date: '2024-01-10', earnings: 168.00, deliveries: 9, tips: 18.50 },
                        { date: '2024-01-11', earnings: 132.00, deliveries: 7, tips: 10.00 },
                        { date: '2024-01-12', earnings: 185.50, deliveries: 10, tips: 22.00 },
                        { date: '2024-01-13', earnings: 198.00, deliveries: 11, tips: 25.50 },
                        { date: '2024-01-14', earnings: 156.00, deliveries: 8, tips: 15.00 },
                        { date: '2024-01-15', earnings: 175.50, deliveries: 9, tips: 20.00 }
                    ],
                    recentPayments: [
                        {
                            id: 1,
                            date: '2024-01-15',
                            amount: 175.50,
                            deliveries: 9,
                            tips: 20.00,
                            status: 'completed'
                        },
                        {
                            id: 2,
                            date: '2024-01-14',
                            amount: 156.00,
                            deliveries: 8,
                            tips: 15.00,
                            status: 'completed'
                        },
                        {
                            id: 3,
                            date: '2024-01-13',
                            amount: 198.00,
                            deliveries: 11,
                            tips: 25.50,
                            status: 'completed'
                        },
                        {
                            id: 4,
                            date: '2024-01-12',
                            amount: 185.50,
                            deliveries: 10,
                            tips: 22.00,
                            status: 'completed'
                        }
                    ],
                    performance: {
                        rating: 4.8,
                        totalDeliveries: 156,
                        completedDeliveries: 152,
                        completionRate: 97.4,
                        averageDeliveryTime: 28
                    }
                };
                setEarnings(mockEarnings);
            }
        } catch (error) {
            console.error('Error loading earnings:', error);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, timeRange]);

    useEffect(() => {
        loadEarnings();
    }, [loadEarnings]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
                    <p className="text-gray-600">Track your earnings and performance</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-900">
                                    ₺{earnings.overview?.totalEarnings.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">+{earnings.overview?.earningsChange}% from last period</p>
                            </div>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">
                            +{earnings.overview?.earningsChange}% from last period
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {earnings.overview?.totalDeliveries}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TruckIcon className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">
                            +{earnings.overview?.deliveriesChange}% from last period
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Tips</p>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-900">
                                    ₺{earnings.overview?.totalTips.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">+{earnings.overview?.tipsChange}% from last period</p>
                            </div>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <StarIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">
                            +{earnings.overview?.tipsChange}% from last period
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Per Delivery</p>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-gray-900">
                                    ₺{earnings.overview?.averagePerDelivery}
                                </p>
                                <p className="text-sm text-gray-500">Average per delivery</p>
                            </div>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-sm text-gray-600">
                            Including tips
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Earnings</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {earnings.weeklyData?.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-primary-500 rounded-t"
                                    style={{
                                        height: `${(data.earnings / Math.max(...earnings.weeklyData.map(d => d.earnings))) * 200}px`
                                    }}
                                ></div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-xs text-gray-600">₺{data.earnings}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <StarIcon className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-700">Rating</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{earnings.performance?.rating}</p>
                                <p className="text-xs text-gray-500">Average</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{earnings.performance?.completionRate}%</p>
                                <p className="text-xs text-gray-500">{earnings.performance?.completedDeliveries}/{earnings.performance?.totalDeliveries}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">Avg Delivery Time</span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{earnings.performance?.averageDeliveryTime} min</p>
                                <p className="text-xs text-gray-500">Per delivery</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
                <div className="space-y-4">
                    {earnings.recentPayments?.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <CalendarIcon className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{payment.date}</p>
                                    <p className="text-sm text-gray-500">{payment.deliveries} deliveries</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-gray-900">${payment.amount}</p>
                                <p className="text-sm text-gray-500">+${payment.tips} tips</p>
                            </div>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {payment.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <CalendarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Best Day</p>
                            <p className="text-2xl font-bold text-gray-900">Saturday</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Best Hour</p>
                            <p className="text-2xl font-bold text-gray-900">2-4 PM</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <StarIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg Tip</p>
                            <p className="text-2xl font-bold text-gray-900">$1.57</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarningsPage;
