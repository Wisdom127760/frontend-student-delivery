import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    TruckIcon,
    XMarkIcon,
    CurrencyDollarIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DeliveriesPage = () => {
    const location = useLocation();
    const [deliveries, setDeliveries] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Side panel states
    const [showCreatePanel, setShowCreatePanel] = useState(false);
    const [showViewPanel, setShowViewPanel] = useState(false);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        pickupLocation: '',
        deliveryLocation: '',
        customerName: '',
        customerPhone: '',
        estimatedTime: '',
        assignedTo: '',
        status: 'pending',
        notes: ''
    });

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        fetchDeliveries();
        fetchDrivers();

        // Check if we should open the create panel
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('create') === 'true') {
            // Clear the query parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            // Open the create panel
            openCreatePanel();
        }
    }, [location.search, fetchDeliveries, fetchDrivers, openCreatePanel]);

    const fetchDeliveries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/deliveries`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDeliveries(data.data || []);
            } else {
                console.error('Failed to fetch deliveries');
                toast.error('Failed to fetch deliveries');
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            toast.error('Error fetching deliveries');
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/drivers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDrivers(data.data || []);
            } else {
                console.error('Failed to fetch drivers');
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const handleCreateDelivery = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            // Prepare the payload according to the backend schema
            const payload = {
                pickupLocation: formData.pickupLocation,
                deliveryLocation: formData.deliveryLocation,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                fee: Number(formData.fee),
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                priority: formData.priority,
                ...(formData.estimatedTime && { estimatedTime: new Date(formData.estimatedTime).toISOString() }),
                ...(formData.assignedTo && { assignedTo: formData.assignedTo })
            };

            const response = await fetch(`${API_BASE_URL}/admin/deliveries`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Delivery created successfully!');
                setShowCreatePanel(false);
                resetForm();
                fetchDeliveries();
            } else {
                console.error('Failed to create delivery:', result);
                if (result.details) {
                    result.details.forEach(detail => {
                        toast.error(`${detail.field}: ${detail.message}`);
                    });
                } else {
                    toast.error(result.error || 'Failed to create delivery');
                }
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            toast.error('Error creating delivery');
        }
    };

    const handleUpdateDelivery = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            const payload = {
                pickupLocation: formData.pickupLocation,
                deliveryLocation: formData.deliveryLocation,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                fee: Number(formData.fee),
                paymentMethod: formData.paymentMethod,
                notes: formData.notes,
                priority: formData.priority,
                ...(formData.estimatedTime && { estimatedTime: new Date(formData.estimatedTime).toISOString() }),
                ...(formData.assignedTo && { assignedTo: formData.assignedTo })
            };

            const response = await fetch(`${API_BASE_URL}/admin/deliveries/${selectedDelivery._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Delivery updated successfully!');
                setShowEditPanel(false);
                resetForm();
                fetchDeliveries();
            } else {
                console.error('Failed to update delivery:', result);
                if (result.details) {
                    result.details.forEach(detail => {
                        toast.error(`${detail.field}: ${detail.message}`);
                    });
                } else {
                    toast.error(result.error || 'Failed to update delivery');
                }
            }
        } catch (error) {
            console.error('Error updating delivery:', error);
            toast.error('Error updating delivery');
        }
    };

    const handleDeleteDelivery = async (deliveryId) => {
        if (!window.confirm('Are you sure you want to delete this delivery?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/deliveries/${deliveryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Delivery deleted successfully!');
                fetchDeliveries();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Failed to delete delivery');
            }
        } catch (error) {
            console.error('Error deleting delivery:', error);
            toast.error('Error deleting delivery');
        }
    };

    const handleStatusUpdate = async (deliveryId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/deliveries/${deliveryId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success(`Delivery status updated to ${newStatus}!`);
                fetchDeliveries();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error updating status');
        }
    };

    const resetForm = () => {
        setFormData({
            pickupLocation: '',
            deliveryLocation: '',
            customerName: '',
            customerPhone: '',
            fee: 150,
            paymentMethod: 'cash',
            estimatedTime: '',
            notes: '',
            priority: 'normal',
            distance: '',
            assignedTo: ''
        });
    };

    const openCreatePanel = () => {
        resetForm();
        setShowCreatePanel(true);
    };

    const openViewPanel = (delivery) => {
        setSelectedDelivery(delivery);
        setShowViewPanel(true);
    };

    const openEditPanel = (delivery) => {
        setSelectedDelivery(delivery);
        setFormData({
            pickupLocation: delivery.pickupLocation || '',
            deliveryLocation: delivery.deliveryLocation || '',
            customerName: delivery.customerName || '',
            customerPhone: delivery.customerPhone || '',
            estimatedTime: delivery.estimatedTime ? new Date(delivery.estimatedTime).toISOString().slice(0, 16) : '',
            assignedTo: delivery.assignedTo || '',
            status: delivery.status || 'pending',
            notes: delivery.notes || ''
        });
        setShowEditPanel(true);
    };

    const filteredDeliveries = deliveries.filter(delivery => {
        const matchesSearch = delivery.deliveryCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.deliveryLocation?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            assigned: 'bg-primary-100 text-primary-800',
            picked_up: 'bg-orange-100 text-orange-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            normal: 'bg-primary-100 text-primary-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage all delivery orders and track their status
                    </p>
                </div>
                <button
                    onClick={openCreatePanel}
                    className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Delivery
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search deliveries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="picked_up">Picked Up</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-end text-sm text-gray-500">
                        {filteredDeliveries.length} of {deliveries.length} deliveries
                    </div>
                </div>
            </div>

            {/* Deliveries List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Delivery
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Route
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Driver
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fee
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDeliveries.map((delivery) => (
                                <tr key={delivery._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <TruckIcon className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {delivery.deliveryCode}
                                                </div>
                                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                                                    {delivery.priority}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{delivery.customerName || 'N/A'}</div>
                                        <div className="text-sm text-gray-500">{delivery.customerPhone || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            <div className="font-medium">From: {delivery.pickupLocation}</div>
                                            <div className="text-gray-500">To: {delivery.deliveryLocation}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {delivery.assignedTo ? (
                                            <div className="flex items-center">
                                                <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {delivery.assignedTo.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {delivery.assignedTo.area}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                            {delivery.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            ₺{delivery.fee}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {delivery.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {delivery.createdAt ? format(new Date(delivery.createdAt), 'MMM dd, yyyy') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openViewPanel(delivery)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditPanel(delivery)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDelivery(delivery._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Delivery Side Panel */}
            {showCreatePanel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Create New Delivery</h3>
                                <button
                                    onClick={() => setShowCreatePanel(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <form id="create-delivery-form" onSubmit={handleCreateDelivery} className="space-y-6">
                                    {/* Route Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Route Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter pickup address"
                                                    value={formData.pickupLocation}
                                                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter delivery address"
                                                    value={formData.deliveryLocation}
                                                    onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter customer name"
                                                    value={formData.customerName}
                                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
                                                <input
                                                    type="tel"
                                                    placeholder="Enter phone number"
                                                    value={formData.customerPhone}
                                                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Fee (₺)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="0"
                                                    value={formData.fee}
                                                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                                <select
                                                    value={formData.paymentMethod}
                                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                >
                                                    <option value="cash">Cash</option>
                                                    <option value="card">Card</option>
                                                    <option value="transfer">Transfer</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignment & Priority */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Assignment & Priority</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                                                <select
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                >
                                                    <option value="low">Low Priority</option>
                                                    <option value="normal">Normal Priority</option>
                                                    <option value="high">High Priority</option>
                                                    <option value="urgent">Urgent</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Driver</label>
                                                <select
                                                    value={formData.assignedTo}
                                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                >
                                                    <option value="">Select Driver</option>
                                                    {drivers.map((driver) => (
                                                        <option key={driver._id} value={driver._id}>
                                                            {driver.name} - {driver.area}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                                                <input
                                                    type="datetime-local"
                                                    value={formData.estimatedTime}
                                                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                                <textarea
                                                    rows="3"
                                                    placeholder="Add any additional notes or special instructions..."
                                                    value={formData.notes}
                                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowCreatePanel(false)}
                                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="create-delivery-form"
                                    className="px-8 py-3 text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 rounded-lg"
                                >
                                    Create Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Delivery Side Panel */}
            {showEditPanel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Edit Delivery</h3>
                                <button
                                    onClick={() => setShowEditPanel(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <form id="edit-delivery-form" onSubmit={handleUpdateDelivery} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.pickupLocation}
                                            onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Delivery Location</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.deliveryLocation}
                                            onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                                            <input
                                                type="text"
                                                value={formData.customerName}
                                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                                            <input
                                                type="tel"
                                                value={formData.customerPhone}
                                                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fee (₺)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.fee}
                                                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                                            <select
                                                value={formData.paymentMethod}
                                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="card">Card</option>
                                                <option value="transfer">Transfer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="normal">Normal</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Assign to Driver</label>
                                            <select
                                                value={formData.assignedTo}
                                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Select Driver</option>
                                                {drivers.map((driver) => (
                                                    <option key={driver._id} value={driver._id}>
                                                        {driver.name} - {driver.area}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.estimatedTime}
                                            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                                        <textarea
                                            rows="3"
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowEditPanel(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="edit-delivery-form"
                                    className="px-6 py-2 text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 rounded-lg"
                                >
                                    Update Delivery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Delivery Side Panel */}
            {showViewPanel && selectedDelivery && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Delivery Details</h3>
                                <button
                                    onClick={() => setShowViewPanel(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-lg font-medium text-gray-900">{selectedDelivery.deliveryCode}</h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDelivery.status)}`}>
                                                {selectedDelivery.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedDelivery.priority)}`}>
                                            {selectedDelivery.priority} priority
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Customer</label>
                                            <div className="mt-1 text-sm text-gray-900">
                                                {selectedDelivery.customerName || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {selectedDelivery.customerPhone || 'N/A'}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Route</label>
                                            <div className="mt-1 text-sm text-gray-900">
                                                <div>From: {selectedDelivery.pickupLocation}</div>
                                                <div>To: {selectedDelivery.deliveryLocation}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Driver</label>
                                            <div className="mt-1 text-sm text-gray-900">
                                                {selectedDelivery.assignedTo ? (
                                                    <div>
                                                        <div>{selectedDelivery.assignedTo.name}</div>
                                                        <div className="text-gray-500">{selectedDelivery.assignedTo.area}</div>
                                                    </div>
                                                ) : (
                                                    'Unassigned'
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Payment</label>
                                            <div className="mt-1 text-sm text-gray-900">
                                                <div>Fee: ₺{selectedDelivery.fee}</div>
                                                <div className="text-gray-500">Method: {selectedDelivery.paymentMethod}</div>
                                            </div>
                                        </div>

                                        {selectedDelivery.estimatedTime && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                                                <div className="mt-1 text-sm text-gray-900">
                                                    {format(new Date(selectedDelivery.estimatedTime), 'MMM dd, yyyy HH:mm')}
                                                </div>
                                            </div>
                                        )}

                                        {selectedDelivery.notes && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                                <div className="mt-1 text-sm text-gray-900">
                                                    {selectedDelivery.notes}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Timeline</label>
                                            <div className="mt-1 space-y-1 text-sm text-gray-900">
                                                <div>Created: {selectedDelivery.createdAt ? format(new Date(selectedDelivery.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}</div>
                                                {selectedDelivery.assignedAt && (
                                                    <div>Assigned: {format(new Date(selectedDelivery.assignedAt), 'MMM dd, yyyy HH:mm')}</div>
                                                )}
                                                {selectedDelivery.pickedUpAt && (
                                                    <div>Picked Up: {format(new Date(selectedDelivery.pickedUpAt), 'MMM dd, yyyy HH:mm')}</div>
                                                )}
                                                {selectedDelivery.deliveredAt && (
                                                    <div>Delivered: {format(new Date(selectedDelivery.deliveredAt), 'MMM dd, yyyy HH:mm')}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                    <button
                                        onClick={() => setShowViewPanel(false)}
                                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveriesPage;
