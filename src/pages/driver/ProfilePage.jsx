import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    StarIcon,
    CalendarIcon,
    TruckIcon,
    CogIcon,
    ShieldCheckIcon,
    BellIcon,
    KeyIcon,
    PencilIcon,
    CameraIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
    const { updateUser } = useAuth();
    const [profile, setProfile] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        area: ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        newDeliveries: true,
        earningsUpdates: true,
        systemAlerts: false
    });

    const [privacySettings, setPrivacySettings] = useState({
        locationSharing: true,
        profileVisibility: 'public',
        dataCollection: true
    });

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    // WebP conversion and compression function
    const convertToWebP = (file) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Set canvas size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image on canvas
                ctx.drawImage(img, 0, 0);

                // Convert to WebP with compression
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/webp', 0.8); // 0.8 quality for good compression
            };

            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log('File selected:', file.name, file.type, file.size);

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        try {
            setUploadingImage(true);
            console.log('Starting image conversion...');

            // Convert to WebP
            const webpBlob = await convertToWebP(file);
            console.log('WebP conversion completed, blob size:', webpBlob.size);

            // For now, just store the image locally as a data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('FileReader completed, data URL length:', e.target.result.length);
                setProfile(prev => ({
                    ...prev,
                    personal: {
                        ...prev.personal,
                        avatar: e.target.result
                    }
                }));
                toast.success('Profile picture updated successfully');
                console.log('Profile updated with new avatar');
            };
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                toast.error('Failed to process image');
            };
            reader.readAsDataURL(webpBlob);

            // TODO: In the future, implement proper backend upload
            // For now, we'll store the image locally
            console.log('Image converted to WebP and stored locally');

        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image: ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/driver/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setProfile(data.data);
                    setFormData({
                        name: data.data.personal?.name || '',
                        email: data.data.personal?.email || '',
                        phone: data.data.personal?.phone || '',
                        area: data.data.personal?.area || ''
                    });

                    // Load notification settings
                    if (data.data.preferences?.notifications) {
                        setNotificationSettings(data.data.preferences.notifications);
                    }

                    // Load privacy settings
                    if (data.data.preferences?.privacy) {
                        setPrivacySettings(data.data.preferences.privacy);
                    }
                }
            } else {
                // Fallback to mock data if API fails
                const mockProfile = {
                    personal: {
                        name: 'Mike Johnson',
                        email: 'mike.johnson@example.com',
                        phone: '+1 555-0123',
                        area: 'Downtown',
                        joinDate: '2023-01-15',
                        avatar: 'MJ',
                        status: 'active'
                    },
                    stats: {
                        totalDeliveries: 156,
                        completedDeliveries: 152,
                        totalEarnings: 2847.50,
                        averageRating: 4.8,
                        completionRate: 97.4
                    },
                    preferences: {
                        notifications: {
                            newDeliveries: true,
                            earningsUpdates: true,
                            systemAlerts: false
                        },
                        privacy: {
                            locationSharing: true,
                            profileVisibility: 'public',
                            dataCollection: true
                        }
                    }
                };
                setProfile(mockProfile);
                setFormData({
                    name: mockProfile.personal.name,
                    email: mockProfile.personal.email,
                    phone: mockProfile.personal.phone,
                    area: mockProfile.personal.area
                });
                setNotificationSettings(mockProfile.preferences.notifications);
                setPrivacySettings(mockProfile.preferences.privacy);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                updateUser(result.data.user);
                setIsEditing(false);
                toast.success('Profile updated successfully');
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: profile.personal?.name || '',
            email: profile.personal?.email || '',
            phone: profile.personal?.phone || '',
            area: profile.personal?.area || ''
        });
        setIsEditing(false);
    };

    const handleNotificationChange = async (setting, value) => {
        try {
            const newSettings = { ...notificationSettings, [setting]: value };
            setNotificationSettings(newSettings);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/driver/settings/notifications`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSettings)
            });

            if (response.ok) {
                toast.success('Notification settings updated');
            } else {
                toast.error('Failed to update notification settings');
            }
        } catch (error) {
            console.error('Error updating notification settings:', error);
            toast.error('Failed to update notification settings');
        }
    };

    const handlePrivacyChange = async (setting, value) => {
        try {
            const newSettings = { ...privacySettings, [setting]: value };
            setPrivacySettings(newSettings);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/driver/settings/privacy`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSettings)
            });

            if (response.ok) {
                toast.success('Privacy settings updated');
            } else {
                toast.error('Failed to update privacy settings');
            }
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            toast.error('Failed to update privacy settings');
        }
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600">Manage your account and preferences</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all duration-200 flex items-center space-x-2"
                >
                    <PencilIcon className="w-5 h-5" />
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="text-center">
                            <div className="relative inline-block">
                                {profile.personal?.avatar && profile.personal.avatar.startsWith('http') ? (
                                    <img
                                        src={profile.personal.avatar}
                                        alt="Profile"
                                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-primary-600">
                                            {profile.personal?.avatar || profile.personal?.name?.charAt(0) || 'D'}
                                        </span>
                                    </div>
                                )}
                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors cursor-pointer">
                                        <CameraIcon className="w-4 h-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                )}
                                {uploadingImage && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{profile.personal?.name}</h2>
                            <p className="text-gray-500">{profile.personal?.email}</p>
                            <div className="mt-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {profile.personal?.status}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Area</label>
                                        <input
                                            type="text"
                                            name="area"
                                            value={formData.area}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-all duration-200"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{profile.personal?.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{profile.personal?.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{profile.personal?.area}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">Joined {new Date(profile.personal?.joinDate).toLocaleDateString()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats and Performance */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{profile.stats?.totalDeliveries}</p>
                                <p className="text-sm text-gray-500">Total Deliveries</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{profile.stats?.completedDeliveries}</p>
                                <p className="text-sm text-gray-500">Completed</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">₺{profile.stats?.totalEarnings.toLocaleString()}</p>
                                <p className="text-sm text-gray-500">Total Earnings</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-center space-x-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="text-2xl font-bold text-gray-900">{profile.stats?.averageRating}</span>
                                </div>
                                <p className="text-sm text-gray-500">Average Rating</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{profile.stats?.completionRate}%</p>
                                <p className="text-sm text-gray-500">Completion Rate</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <BellIcon className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">New Deliveries</p>
                                <p className="text-sm text-gray-500">Get notified when new deliveries are assigned</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notificationSettings.newDeliveries}
                                    onChange={(e) => handleNotificationChange('newDeliveries', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Earnings Updates</p>
                                <p className="text-sm text-gray-500">Daily and weekly earnings summaries</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notificationSettings.earningsUpdates}
                                    onChange={(e) => handleNotificationChange('earningsUpdates', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">System Alerts</p>
                                <p className="text-sm text-gray-500">Important system notifications</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={notificationSettings.systemAlerts}
                                    onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Privacy & Security */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Location Sharing</p>
                                <p className="text-sm text-gray-500">Share location during deliveries</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={privacySettings.locationSharing}
                                    onChange={(e) => handlePrivacyChange('locationSharing', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Profile Visibility</p>
                                <p className="text-sm text-gray-500">Who can see your profile</p>
                            </div>
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                value={privacySettings.profileVisibility}
                                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="drivers">Drivers Only</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">Data Collection</p>
                                <p className="text-sm text-gray-500">Allow data collection for analytics</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={privacySettings.dataCollection}
                                    onChange={(e) => handlePrivacyChange('dataCollection', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <KeyIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Change Password</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <CogIcon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Account Settings</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        <TruckIcon className="w-5 h-5 text-red-600" />
                        <span className="text-red-700">Deactivate Account</span>
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
