import React, { useState, useEffect } from 'react';
import {
    CurrencyDollarIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    CheckIcon,
    XMarkIcon,
    CogIcon,
    CalculatorIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EarningsManagementPage = () => {
    const [configs, setConfigs] = useState([]);
    const [activeConfig, setActiveConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState(null);
    const [testFee, setTestFee] = useState(150);
    const [testResult, setTestResult] = useState(null);

    // Form state
    const [newConfig, setNewConfig] = useState({
        name: '',
        rules: [
            {
                minFee: 0,
                maxFee: 100,
                driverPercentage: 60,
                driverFixed: null,
                companyPercentage: 40,
                companyFixed: null,
                description: 'Deliveries up to ₺100: 60% to driver, 40% to company'
            },
            {
                minFee: 101,
                maxFee: 150,
                driverPercentage: null,
                driverFixed: 100,
                companyPercentage: null,
                companyFixed: 50,
                description: 'Deliveries ₺101-₺150: ₺100 to driver, ₺50 to company'
            },
            {
                minFee: 151,
                maxFee: 999999,
                driverPercentage: 60,
                driverFixed: null,
                companyPercentage: 40,
                companyFixed: null,
                description: 'Deliveries over ₺150: 60% to driver, 40% to company'
            }
        ],
        notes: ''
    });

    const [submitting, setSubmitting] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Load all configurations
            const configsResponse = await fetch(`${API_BASE_URL}/earnings-config`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (configsResponse.ok) {
                const configsData = await configsResponse.json();
                if (configsData.success) {
                    // Filter out any invalid configurations
                    const validConfigs = (configsData.data.configs || []).filter(config =>
                        config &&
                        typeof config === 'object' &&
                        Array.isArray(config.rules) &&
                        config.rules.length > 0
                    );
                    setConfigs(validConfigs);
                }
            }

            // Load active configuration
            const activeResponse = await fetch(`${API_BASE_URL}/earnings-config/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (activeResponse.ok) {
                const activeData = await activeResponse.json();
                if (activeData.success && activeData.data) {
                    // Validate active config data
                    const activeConfig = activeData.data;
                    if (activeConfig &&
                        typeof activeConfig === 'object' &&
                        Array.isArray(activeConfig.rules) &&
                        activeConfig.rules.length > 0) {
                        setActiveConfig(activeConfig);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading earnings configurations:', error);
            toast.error('Failed to load earnings configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateConfig = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // Clean the rules data before submission
            const cleanedConfig = {
                ...newConfig,
                rules: cleanRulesForSubmission(newConfig.rules)
            };

            const response = await fetch(`${API_BASE_URL}/earnings-config`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedConfig)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    toast.success('Earnings configuration created successfully');
                    setShowCreateModal(false);
                    setNewConfig({
                        name: '',
                        rules: [
                            {
                                minFee: 0,
                                maxFee: 100,
                                driverPercentage: 60,
                                driverFixed: null,
                                companyPercentage: 40,
                                companyFixed: null,
                                description: 'Deliveries up to ₺100: 60% to driver, 40% to company'
                            },
                            {
                                minFee: 101,
                                maxFee: 150,
                                driverPercentage: null,
                                driverFixed: 100,
                                companyPercentage: null,
                                companyFixed: 50,
                                description: 'Deliveries ₺101-₺150: ₺100 to driver, ₺50 to company'
                            },
                            {
                                minFee: 151,
                                maxFee: 999999,
                                driverPercentage: 60,
                                driverFixed: null,
                                companyPercentage: 40,
                                companyFixed: null,
                                description: 'Deliveries over ₺150: 60% to driver, 40% to company'
                            }
                        ],
                        notes: ''
                    });
                    loadConfigs();
                } else {
                    toast.error(result.error || 'Failed to create configuration');
                }
            } else {
                toast.error('Failed to create configuration');
            }
        } catch (error) {
            console.error('Error creating configuration:', error);
            toast.error('Error creating configuration');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');

            // Clean the rules data before submission
            const cleanedConfig = {
                ...newConfig,
                rules: cleanRulesForSubmission(newConfig.rules)
            };

            const response = await fetch(`${API_BASE_URL}/earnings-config/${selectedConfig._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedConfig)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    toast.success('Earnings configuration updated successfully');
                    setShowEditModal(false);
                    setSelectedConfig(null);
                    loadConfigs();
                } else {
                    toast.error(result.error || 'Failed to update configuration');
                }
            } else {
                toast.error('Failed to update configuration');
            }
        } catch (error) {
            console.error('Error updating configuration:', error);
            toast.error('Error updating configuration');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfig = async (configId) => {
        if (!window.confirm('Are you sure you want to delete this configuration?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/earnings-config/${configId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Configuration deleted successfully');
                loadConfigs();
            } else {
                toast.error('Failed to delete configuration');
            }
        } catch (error) {
            console.error('Error deleting configuration:', error);
            toast.error('Error deleting configuration');
        }
    };

    const handleTestCalculation = async () => {
        try {
            if (!testFee || testFee <= 0) {
                toast.error('Please enter a valid fee amount');
                return;
            }

            if (!activeConfig || !activeConfig.rules || activeConfig.rules.length === 0) {
                toast.error('No active earnings configuration found');
                return;
            }

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/earnings-config/test-calculation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fee: parseInt(testFee) })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setTestResult(result.data);
                } else {
                    toast.error(result.error || 'Failed to test calculation');
                }
            } else {
                toast.error('Failed to test calculation');
            }
        } catch (error) {
            console.error('Error testing calculation:', error);
            toast.error('Error testing calculation');
        }
    };

    const openEditModal = (config) => {
        setSelectedConfig(config);
        setNewConfig({
            name: config.name,
            rules: config.rules,
            notes: config.notes || ''
        });
        setShowEditModal(true);
    };

    const addRule = () => {
        setNewConfig(prev => ({
            ...prev,
            rules: [...prev.rules.filter(rule => rule && typeof rule === 'object'), {
                minFee: 0,
                maxFee: 0,
                driverPercentage: null,
                driverFixed: null,
                companyPercentage: null,
                companyFixed: null,
                description: ''
            }]
        }));
    };

    const removeRule = (index) => {
        setNewConfig(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    const updateRule = (index, field, value) => {
        setNewConfig(prev => ({
            ...prev,
            rules: prev.rules.map((rule, i) =>
                i === index ? { ...rule, [field]: value } : rule
            )
        }));
    };

    const formatRule = (rule) => {
        if (!rule || typeof rule !== 'object') {
            return 'Invalid rule';
        }

        // Add additional safety checks
        const minFee = rule.minFee || 0;
        const maxFee = rule.maxFee || 0;

        if (rule.driverFixed !== null && rule.driverFixed !== undefined) {
            return `₺${minFee}-₺${maxFee}: Fixed ₺${rule.driverFixed} to driver`;
        } else if (rule.driverPercentage !== null && rule.driverPercentage !== undefined) {
            return `₺${minFee}-₺${maxFee}: ${rule.driverPercentage}% to driver`;
        }
        return `₺${minFee}-₺${maxFee}: Custom rule`;
    };

    const cleanRulesForSubmission = (rules) => {
        return rules.filter(rule => rule && typeof rule === 'object').map(rule => ({
            minFee: rule.minFee || 0,
            maxFee: rule.maxFee || 0,
            driverPercentage: rule.driverPercentage,
            driverFixed: rule.driverFixed,
            companyPercentage: rule.companyPercentage,
            companyFixed: rule.companyFixed,
            description: rule.description || ''
        }));
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
            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Earnings Management</h1>
                        <p className="text-gray-600">Configure driver earnings rules and calculations</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        New Configuration
                    </button>
                </div>
            </div>

            {/* Active Configuration */}
            {activeConfig && activeConfig.rules && Array.isArray(activeConfig.rules) && (
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Active Configuration</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Active
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <span className="font-medium text-gray-700">Name:</span> {activeConfig.name}
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Rules:</span>
                            <div className="mt-2 space-y-1">
                                {activeConfig.rules.filter(rule => rule && typeof rule === 'object').map((rule, index) => (
                                    <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        {formatRule(rule)}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {activeConfig.notes && (
                            <div>
                                <span className="font-medium text-gray-700">Notes:</span> {activeConfig.notes}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Test Calculation */}
            <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Calculation</h2>
                <div className="flex items-center space-x-4">
                    <input
                        type="number"
                        value={testFee}
                        onChange={(e) => setTestFee(e.target.value)}
                        placeholder="Enter fee amount"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <button
                        onClick={handleTestCalculation}
                        disabled={!activeConfig || !activeConfig.rules || activeConfig.rules.length === 0}
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CalculatorIcon className="h-5 w-5 mr-2" />
                        Test
                    </button>
                </div>
                {testResult && (
                    <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                        <h3 className="font-medium text-primary-900 mb-2">Calculation Result:</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fee:</span>
                                <span className="font-medium">₺{testResult.fee}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Driver Earnings:</span>
                                <span className="font-medium text-green-600">₺{testResult.earnings?.driverEarning || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Company Earnings:</span>
                                <span className="font-medium text-blue-600">₺{testResult.earnings?.companyEarning || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rule Applied:</span>
                                <span className="font-medium text-primary-600">₺{testResult.earnings?.ruleApplied?.minFee || 0}-₺{testResult.earnings?.ruleApplied?.maxFee || 0}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* All Configurations */}
            <div className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">All Configurations</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rules
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Version
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {configs.filter(config => config && typeof config === 'object' && Array.isArray(config.rules)).map((config) => (
                                <tr key={config._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{config.name}</div>
                                        <div className="text-sm text-gray-500">{config.notes}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {config.rules.filter(rule => rule && typeof rule === 'object').slice(0, 2).map((rule, index) => (
                                                <div key={index} className="text-sm text-gray-600">
                                                    {formatRule(rule)}
                                                </div>
                                            ))}
                                            {config.rules.filter(rule => rule && typeof rule === 'object').length > 2 && (
                                                <div className="text-sm text-gray-500">
                                                    +{config.rules.filter(rule => rule && typeof rule === 'object').length - 2} more rules
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {config.isActive ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        v{config.version}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => openEditModal(config)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            {!config.isActive && (
                                                <button
                                                    onClick={() => handleDeleteConfig(config._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Configuration Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Create Earnings Configuration</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateConfig} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={newConfig.name}
                                    onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rules</label>
                                <div className="mt-2 space-y-4">
                                    {newConfig.rules.filter(rule => rule && typeof rule === 'object').map((rule, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-700">Rule {index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRule(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Min Fee</label>
                                                    <input
                                                        type="number"
                                                        value={rule.minFee}
                                                        onChange={(e) => updateRule(index, 'minFee', parseInt(e.target.value))}
                                                        className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Max Fee</label>
                                                    <input
                                                        type="number"
                                                        value={rule.maxFee}
                                                        onChange={(e) => updateRule(index, 'maxFee', parseInt(e.target.value))}
                                                        className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Driver Percentage (%)</label>
                                                    <input
                                                        type="number"
                                                        value={rule.driverPercentage || ''}
                                                        onChange={(e) => updateRule(index, 'driverPercentage', e.target.value ? parseInt(e.target.value) : null)}
                                                        className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        placeholder="Leave empty for fixed amount"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Driver Fixed Amount</label>
                                                    <input
                                                        type="number"
                                                        value={rule.driverFixed || ''}
                                                        onChange={(e) => updateRule(index, 'driverFixed', e.target.value ? parseInt(e.target.value) : null)}
                                                        className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        placeholder="Leave empty for percentage"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <label className="block text-xs font-medium text-gray-700">Description</label>
                                                <input
                                                    type="text"
                                                    value={rule.description}
                                                    onChange={(e) => updateRule(index, 'description', e.target.value)}
                                                    className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addRule}
                                    className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Rule
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea
                                    value={newConfig.notes}
                                    onChange={(e) => setNewConfig(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Configuration Modal */}
            {showEditModal && selectedConfig && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Edit Earnings Configuration</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateConfig} className="space-y-6">
                            {/* Same form fields as create modal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={newConfig.name}
                                    onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rules</label>
                                <div className="mt-2 space-y-4">
                                    {newConfig.rules.filter(rule => rule && typeof rule === 'object').map((rule, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-700">Rule {index + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRule(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Min Fee</label>
                                                    <input
                                                        type="number"
                                                        value={rule.minFee}
                                                        onChange={(e) => updateRule(index, 'minFee', parseInt(e.target.value))}
                                                        className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Max Fee</label>
                                                    <input
                                                        type="number"
                                                        value={rule.maxFee}
                                                        onChange={(e) => updateRule(index, 'maxFee', parseInt(e.target.value))}
                                                        className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Driver Percentage (%)</label>
                                                    <input
                                                        type="number"
                                                        value={rule.driverPercentage || ''}
                                                        onChange={(e) => updateRule(index, 'driverPercentage', e.target.value ? parseInt(e.target.value) : null)}
                                                        className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        placeholder="Leave empty for fixed amount"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700">Driver Fixed Amount</label>
                                                    <input
                                                        type="number"
                                                        value={rule.driverFixed || ''}
                                                        onChange={(e) => updateRule(index, 'driverFixed', e.target.value ? parseInt(e.target.value) : null)}
                                                        className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        placeholder="Leave empty for percentage"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <label className="block text-xs font-medium text-gray-700">Description</label>
                                                <input
                                                    type="text"
                                                    value={rule.description}
                                                    onChange={(e) => updateRule(index, 'description', e.target.value)}
                                                    className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addRule}
                                    className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Rule
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea
                                    value={newConfig.notes}
                                    onChange={(e) => setNewConfig(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Updating...' : 'Update Configuration'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EarningsManagementPage; 