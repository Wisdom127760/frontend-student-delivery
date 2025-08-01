import React, { useState, useEffect, useCallback } from 'react';
import {
    TruckIcon,
    MapPinIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PhoneIcon,
    EyeIcon,
    PlayIcon
} from '@heroicons/react/24/outline';

const MyDeliveries = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    const loadDeliveries = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/driver/deliveries`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const formattedDeliveries = data.data.deliveries.map(delivery => ({
                        id: delivery._id,
                        deliveryCode: delivery.deliveryCode,
                        customerName: delivery.customerName || 'N/A',
                        customerPhone: delivery.customerPhone || 'N/A',
                        pickupAddress: delivery.pickupLocation,
                        deliveryAddress: delivery.deliveryLocation,
                        amount: delivery.fee,
                        status: delivery.status,
                        estimatedTime: delivery.estimatedTime ? new Date(delivery.estimatedTime).toLocaleTimeString() : 'N/A',
                        createdAt: delivery.createdAt,
                        startedAt: delivery.startedAt,
                        completedAt: delivery.completedAt,
                        notes: delivery.notes || ''
                    }));
                    setDeliveries(formattedDeliveries);
                }
            } else {
                // Fallback to mock data if API fails
                const mockDeliveries = [
                    {
                        id: 1,
                        deliveryCode: 'GRP-123456',
                        customerName: 'John Smith',
                        customerPhone: '+1 555-0123',
                        pickupAddress: '123 Main St, Downtown',
                        deliveryAddress: '456 Oak Ave, Uptown',
                        amount: 45.00,
                        status: 'assigned',
                        estimatedTime: '25 min',
                        createdAt: '2024-01-15T10:30:00Z',
                        startedAt: '2024-01-15T10:35:00Z',
                        completedAt: null,
                        notes: 'Customer prefers contactless delivery'
                    },
                    {
                        id: 2,
                        deliveryCode: 'GRP-123457',
                        customerName: 'Sarah Wilson',
                        customerPhone: '+1 555-0456',
                        pickupAddress: '789 Pine St, Midtown',
                        deliveryAddress: '321 Elm St, Westside',
                        amount: 32.50,
                        status: 'pending',
                        estimatedTime: '18 min',
                        createdAt: '2024-01-15T11:00:00Z',
                        startedAt: null,
                        completedAt: null,
                        notes: 'Fragile items - handle with care'
                    },
                    {
                        id: 3,
                        deliveryCode: 'GRP-123458',
                        customerName: 'David Lee',
                        customerPhone: '+1 555-0789',
                        pickupAddress: '654 Maple Dr, Eastside',
                        deliveryAddress: '987 Cedar Ln, Northside',
                        amount: 28.00,
                        status: 'delivered',
                        estimatedTime: '22 min',
                        createdAt: '2024-01-15T09:00:00Z',
                        startedAt: '2024-01-15T09:05:00Z',
                        completedAt: '2024-01-15T09:25:00Z',
                        notes: 'Delivered successfully'
                    }
                ];
                setDeliveries(mockDeliveries);
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        loadDeliveries();
    }, [loadDeliveries]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'text-green-600 bg-green-100';
            case 'assigned':
                return 'text-blue-600 bg-blue-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'assigned':
                return <TruckIcon className="w-4 h-4" />;
            case 'pending':
                return <ExclamationTriangleIcon className="w-4 h-4" />;
            default:
                return <ClockIcon className="w-4 h-4" />;
        }
    };

    const filteredDeliveries = deliveries.filter(delivery => {
        return statusFilter === 'all' || delivery.status === statusFilter;
    });

    const handleStartDelivery = async (deliveryId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/driver/deliveries/${deliveryId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'picked_up' })
            });

            if (response.ok) {
                setDeliveries(prev => prev.map(d =>
                    d.id === deliveryId
                        ? { ...d, status: 'picked_up', startedAt: new Date().toISOString() }
                        : d
                ));
            } else {
                const errorData = await response.json();
                console.error('Failed to update delivery status:', errorData.error);
                // You could add a toast notification here to show the error to the user
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
        }
    };

    const handleCompleteDelivery = async (deliveryId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/driver/deliveries/${deliveryId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'delivered' })
            });

            if (response.ok) {
                setDeliveries(prev => prev.map(d =>
                    d.id === deliveryId
                        ? { ...d, status: 'delivered', completedAt: new Date().toISOString() }
                        : d
                ));
            } else {
                const errorData = await response.json();
                console.error('Failed to update delivery status:', errorData.error);
                // You could add a toast notification here to show the error to the user
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
                    <p className="text-gray-600">Track and manage your delivery assignments</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">All Deliveries</option>
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TruckIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Today</p>
                            <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {deliveries.filter(d => d.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <TruckIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Assigned</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {deliveries.filter(d => d.status === 'assigned').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Delivered</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {deliveries.filter(d => d.status === 'delivered').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
                {filteredDeliveries.map((delivery) => (
                    <div key={delivery.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${getStatusColor(delivery.status)}`}>
                                    {getStatusIcon(delivery.status)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{delivery.deliveryCode}</h3>
                                    <p className="text-sm text-gray-500">{delivery.customerName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">${delivery.amount}</p>
                                <p className="text-sm text-gray-500">{delivery.estimatedTime}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm">
                                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Pickup: {delivery.pickupAddress}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <MapPinIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">Delivery: {delivery.deliveryAddress}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600">{delivery.customerPhone}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium">
                                        {new Date(delivery.createdAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                {delivery.notes && (
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Notes:</span> {delivery.notes}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            {(delivery.status === 'assigned' || delivery.status === 'pending') && (
                                <button
                                    onClick={() => handleStartDelivery(delivery.id)}
                                    className="flex-1 bg-primary-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-primary-700 transition-colors flex items-center justify-center"
                                >
                                    <PlayIcon className="w-4 h-4 mr-1" />
                                    Start Delivery
                                </button>
                            )}
                            {(delivery.status === 'picked_up' || delivery.status === 'in_progress') && (
                                <button
                                    onClick={() => handleCompleteDelivery(delivery.id)}
                                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                                >
                                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                                    Complete Delivery
                                </button>
                            )}
                            <button
                                onClick={() => window.open(`/track/${delivery.deliveryCode}`, '_blank')}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                            >
                                <EyeIcon className="w-4 h-4 mr-1" />
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDeliveries.length === 0 && (
                <div className="text-center py-12">
                    <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
                    <p className="text-gray-500">You don't have any deliveries matching your current filter.</p>
                </div>
            )}
        </div>
    );
};

export default MyDeliveries;
