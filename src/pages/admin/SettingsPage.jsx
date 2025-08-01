import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    Cog6ToothIcon,
    BellIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    KeyIcon,
    UserGroupIcon,
    TruckIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    CurrencyEuroIcon,
    CurrencyPoundIcon,
    CurrencyYenIcon
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: true,
            sms: false,
            deliveryUpdates: true,
            driverAssignments: true,
            systemAlerts: true
        },
        display: {
            language: 'en',
            timezone: 'Europe/Istanbul',
            currency: 'TRY'
        },
        security: {
            twoFactor: false,
            sessionTimeout: 30,
            loginNotifications: true
        }
    });

    const currencies = [
        { code: 'TRY', symbol: '₺', name: 'Turkish Lira', icon: CurrencyYenIcon },
        { code: 'USD', symbol: '$', name: 'US Dollar', icon: CurrencyDollarIcon },
        { code: 'EUR', symbol: '€', name: 'Euro', icon: CurrencyEuroIcon },
        { code: 'GBP', symbol: '£', name: 'British Pound', icon: CurrencyPoundIcon }
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' }
    ];

    const timezones = [
        { value: 'Europe/Istanbul', label: 'Istanbul (UTC+3)' },
        { value: 'UTC', label: 'UTC (UTC+0)' },
        { value: 'America/New_York', label: 'New York (UTC-5)' },
        { value: 'Europe/London', label: 'London (UTC+0)' }
    ];

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, []);

    const handleSettingChange = (category, setting, value) => {
        const newSettings = {
            ...settings,
            [category]: {
                ...settings[category],
                [setting]: value
            }
        };
        setSettings(newSettings);

        // Handle setting changes

        // Save to localStorage
        localStorage.setItem('userSettings', JSON.stringify(newSettings));
    };

    const handleSaveSettings = async () => {
        try {
            setLoading(true);

            // Save settings to localStorage
            localStorage.setItem('userSettings', JSON.stringify(settings));
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const permissions = [
        { name: 'Create Deliveries', icon: TruckIcon, granted: true },
        { name: 'Edit Deliveries', icon: TruckIcon, granted: true },
        { name: 'Delete Deliveries', icon: TruckIcon, granted: true },
        { name: 'Manage Drivers', icon: UserGroupIcon, granted: true },
        { name: 'View Analytics', icon: ChartBarIcon, granted: true },
        { name: 'System Settings', icon: Cog6ToothIcon, granted: user?.role === 'super_admin' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">Manage your account preferences and system settings</p>
                </div>
                <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    )}
                    Save Settings
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications Settings */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <BellIcon className="h-6 w-6 text-primary-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                                <p className="text-xs text-gray-500">Receive notifications via email</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('notifications', 'email', !settings.notifications.email)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications.email ? 'bg-primary-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                                <p className="text-xs text-gray-500">Receive push notifications</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('notifications', 'push', !settings.notifications.push)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications.push ? 'bg-primary-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Delivery Updates</p>
                                <p className="text-xs text-gray-500">Get notified about delivery status changes</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('notifications', 'deliveryUpdates', !settings.notifications.deliveryUpdates)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications.deliveryUpdates ? 'bg-primary-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.deliveryUpdates ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Driver Assignments</p>
                                <p className="text-xs text-gray-500">Notify when drivers are assigned</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('notifications', 'driverAssignments', !settings.notifications.driverAssignments)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications.driverAssignments ? 'bg-primary-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.driverAssignments ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <GlobeAltIcon className="h-6 w-6 text-primary-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Display</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select
                                value={settings.display.language}
                                onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                            <select
                                value={settings.display.currency}
                                onChange={(e) => handleSettingChange('display', 'currency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {currencies.map(currency => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.symbol} {currency.name} ({currency.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select
                                value={settings.display.timezone}
                                onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                {timezones.map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <ShieldCheckIcon className="h-6 w-6 text-primary-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                                <p className="text-xs text-gray-500">Add an extra layer of security</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('security', 'twoFactor', !settings.security.twoFactor)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.security.twoFactor ? 'bg-primary-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Login Notifications</p>
                                <p className="text-xs text-gray-500">Get notified of new login attempts</p>
                            </div>
                            <button
                                onClick={() => handleSettingChange('security', 'loginNotifications', !settings.security.loginNotifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.security.loginNotifications ? 'bg-primary-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.security.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <select
                                value={settings.security.sessionTimeout}
                                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                                <option value={120}>2 hours</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <KeyIcon className="h-6 w-6 text-primary-600 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
                    </div>
                    <div className="space-y-3">
                        {permissions.map((permission) => {
                            const Icon = permission.icon;
                            return (
                                <div key={permission.name} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Icon className="h-4 w-4 text-gray-400 mr-3" />
                                        <span className="text-sm text-gray-900">{permission.name}</span>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${permission.granted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {permission.granted ? 'Granted' : 'Denied'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage; 