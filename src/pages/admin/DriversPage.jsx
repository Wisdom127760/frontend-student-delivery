import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UserGroupIcon,
    StarIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
    TruckIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DriversPage = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [areaFilter, setAreaFilter] = useState('all');
    const [lastRefresh, setLastRefresh] = useState(null);
    const [nextRefresh, setNextRefresh] = useState(null);

    // Modal states
    const [showCreatePanel, setShowCreatePanel] = useState(false);
    const [showDetailsPanel, setShowDetailsPanel] = useState(false);
    const [showEditPanel, setShowEditPanel] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // Form state
    const [newDriver, setNewDriver] = useState({
        name: '',
        email: '',
        phone: '',
        studentId: '',
        area: 'Other'
    });

    // Loading state for form submission
    const [submitting, setSubmitting] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        loadDrivers();

        // Auto-refresh every 60 seconds
        const refreshInterval = setInterval(() => {
            console.log('Auto-refreshing drivers data...');
            loadDrivers();
        }, 60000); // 60 seconds

        return () => {
            clearInterval(refreshInterval);
        };
    }, []);

    const loadDrivers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/drivers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setDrivers(result.data || []);
                    setLastRefresh(new Date());
                    setNextRefresh(new Date(Date.now() + 60000)); // 60 seconds

                    // Show success toast for manual refresh
                    if (!loading) {
                        toast.success(`Drivers data refreshed successfully (${result.data?.length || 0} drivers)`);
                    }
                } else {
                    console.error('Failed to load drivers:', result.error);
                    toast.error('Failed to load drivers');
                }
            } else {
                console.error('Failed to load drivers:', response.status);
                toast.error('Failed to load drivers');
            }
        } catch (error) {
            console.error('Error loading drivers:', error);
            toast.error('Error loading drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDriver = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/drivers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newDriver)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Driver created successfully!');
                setShowCreatePanel(false);
                setNewDriver({
                    name: '',
                    email: '',
                    phone: '',
                    studentId: '',
                    area: 'Other'
                });
                loadDrivers();
            } else {
                console.error('Failed to create driver:', result);
                if (result.details) {
                    result.details.forEach(detail => {
                        toast.error(`${detail.field}: ${detail.message}`);
                    });
                } else {
                    toast.error(result.error || 'Failed to create driver');
                }
            }
        } catch (error) {
            console.error('Error creating driver:', error);
            toast.error('Error creating driver');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateDriver = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/drivers/${selectedDriver._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newDriver)
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Driver updated successfully!');
                setShowEditPanel(false);
                loadDrivers();
            } else {
                console.error('Failed to update driver:', result);
                if (result.details) {
                    result.details.forEach(detail => {
                        toast.error(`${detail.field}: ${detail.message}`);
                    });
                } else {
                    toast.error(result.error || 'Failed to update driver');
                }
            }
        } catch (error) {
            console.error('Error updating driver:', error);
            toast.error('Error updating driver');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDriver = async (id) => {
        if (!window.confirm('Are you sure you want to delete this driver?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/drivers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Driver deleted successfully!');
                loadDrivers();
            } else {
                const result = await response.json();
                toast.error(result.error || 'Failed to delete driver');
            }
        } catch (error) {
            console.error('Error deleting driver:', error);
            toast.error('Error deleting driver');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDriver(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openCreatePanel = () => {
        setNewDriver({
            name: '',
            email: '',
            phone: '',
            studentId: '',
            area: 'Other'
        });
        setShowCreatePanel(true);
    };

    const openDetailsPanel = (driver) => {
        setSelectedDriver(driver);
        setShowDetailsPanel(true);
    };

    const openEditPanel = (driver) => {
        setSelectedDriver(driver);
        setNewDriver({
            name: driver.name || '',
            email: driver.email || '',
            phone: driver.phone || '',
            studentId: driver.studentId || '',
            area: driver.area || 'Other'
        });
        setShowEditPanel(true);
    };

    const getStatusColor = (status) => {
        if (status === 'active' || status === true) return 'text-green-600 bg-green-100';
        if (status === 'inactive' || status === false) return 'text-red-600 bg-red-100';
        return 'text-gray-600 bg-gray-100';
    };

    const getStatusIcon = (status) => {
        if (status === 'active' || status === true) return CheckCircleIcon;
        if (status === 'inactive' || status === false) return XCircleIcon;
        return ClockIcon;
    };

    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && driver.isActive) ||
            (statusFilter === 'inactive' && !driver.isActive);

        const matchesArea = areaFilter === 'all' || driver.area === areaFilter;

        return matchesSearch && matchesStatus && matchesArea;
    });

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
                    <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage all delivery drivers and their information
                    </p>
                    {/* Refresh indicator */}
                    {lastRefresh && (
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                            {nextRefresh && (
                                <span className="ml-2">
                                    • Next refresh: {nextRefresh.toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={loadDrivers}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={openCreatePanel}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Driver
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search drivers..."
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Area Filter */}
                    <div>
                        <select
                            value={areaFilter}
                            onChange={(e) => setAreaFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="all">All Areas</option>
                            <option value="Gonyeli">Gonyeli</option>
                            <option value="Kucuk">Kucuk</option>
                            <option value="Lefkosa">Lefkosa</option>
                            <option value="Famagusta">Famagusta</option>
                            <option value="Kyrenia">Kyrenia</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-end text-sm text-gray-500">
                        {filteredDrivers.length} of {drivers.length} drivers
                    </div>
                </div>
            </div>

            {/* Drivers List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Driver
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Area
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDrivers.map((driver) => {
                                const StatusIcon = getStatusIcon(driver.isActive);
                                return (
                                    <tr key={driver._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                        <UserGroupIcon className="h-6 w-6 text-primary-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {driver.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {driver.studentId || 'No ID'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{driver.email}</div>
                                            <div className="text-sm text-gray-500">{driver.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{driver.area}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <StatusIcon className="h-4 w-4 mr-2" />
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(driver.isActive)}`}>
                                                    {driver.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {driver.totalDeliveries || 0} deliveries
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ₺{driver.totalEarnings || 0} earned
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => openDetailsPanel(driver)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditPanel(driver)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteDriver(driver._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Driver Side Panel */}
            {showCreatePanel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Add New Driver</h3>
                                <button
                                    onClick={() => setShowCreatePanel(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <form id="create-driver-form" onSubmit={handleCreateDriver} className="space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    placeholder="Enter driver's full name"
                                                    value={newDriver.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    placeholder="Enter email address"
                                                    value={newDriver.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    placeholder="Enter phone number"
                                                    value={newDriver.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Academic Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                                                <input
                                                    type="text"
                                                    name="studentId"
                                                    placeholder="Enter student ID (optional)"
                                                    value={newDriver.studentId}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Area</label>
                                                <select
                                                    name="area"
                                                    value={newDriver.area}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                >
                                                    <option value="Gonyeli">Gonyeli</option>
                                                    <option value="Kucuk">Kucuk</option>
                                                    <option value="Lefkosa">Lefkosa</option>
                                                    <option value="Famagusta">Famagusta</option>
                                                    <option value="Kyrenia">Kyrenia</option>
                                                    <option value="Other">Other</option>
                                                </select>
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
                                    form="create-driver-form"
                                    disabled={submitting}
                                    className="px-8 py-3 text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Driver'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Driver Side Panel */}
            {showEditPanel && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Edit Driver</h3>
                                <button
                                    onClick={() => setShowEditPanel(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <form id="edit-driver-form" onSubmit={handleUpdateDriver} className="space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    placeholder="Enter driver's full name"
                                                    value={newDriver.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    placeholder="Enter email address"
                                                    value={newDriver.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    placeholder="Enter phone number"
                                                    value={newDriver.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Academic Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                                                <input
                                                    type="text"
                                                    name="studentId"
                                                    placeholder="Enter student ID (optional)"
                                                    value={newDriver.studentId}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Service Area</label>
                                                <select
                                                    name="area"
                                                    value={newDriver.area}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                                                >
                                                    <option value="Gonyeli">Gonyeli</option>
                                                    <option value="Kucuk">Kucuk</option>
                                                    <option value="Lefkosa">Lefkosa</option>
                                                    <option value="Famagusta">Famagusta</option>
                                                    <option value="Kyrenia">Kyrenia</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setShowEditPanel(false)}
                                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="edit-driver-form"
                                    disabled={submitting}
                                    className="px-8 py-3 text-sm font-medium text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 rounded-lg disabled:opacity-50"
                                >
                                    {submitting ? 'Updating...' : 'Update Driver'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Driver Details Side Panel */}
            {showDetailsPanel && selectedDriver && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
                    <div className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Driver Details</h3>
                                <button
                                    onClick={() => setShowDetailsPanel(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <UserGroupIcon className="h-8 w-8 text-blue-600" />
                                            <div className="ml-3">
                                                <h4 className="text-lg font-medium text-gray-900">{selectedDriver.name}</h4>
                                                <p className="text-sm text-gray-500">{selectedDriver.studentId || 'No Student ID'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <div className="mt-1 text-sm text-gray-900 flex items-center">
                                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                                {selectedDriver.email}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                                            <div className="mt-1 text-sm text-gray-900 flex items-center">
                                                <PhoneIcon className="h-4 w-4 mr-2" />
                                                {selectedDriver.phone}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Area</label>
                                            <div className="mt-1 text-sm text-gray-900 flex items-center">
                                                <MapPinIcon className="h-4 w-4 mr-2" />
                                                {selectedDriver.area}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDriver.isActive)}`}>
                                                    {selectedDriver.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Performance</label>
                                            <div className="mt-1 space-y-1">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <TruckIcon className="h-4 w-4 mr-2" />
                                                    {selectedDriver.totalDeliveries || 0} total deliveries
                                                </div>
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                                                    ₺{selectedDriver.totalEarnings || 0} total earnings
                                                </div>
                                                {selectedDriver.rating && (
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <StarIcon className="h-4 w-4 mr-2" />
                                                        {selectedDriver.rating} average rating
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Joined</label>
                                            <div className="mt-1 text-sm text-gray-900">
                                                {selectedDriver.createdAt ? new Date(selectedDriver.createdAt).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                                    <button
                                        onClick={() => setShowDetailsPanel(false)}
                                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
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

export default DriversPage;
