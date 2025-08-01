import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    ShieldCheckIcon,
    PencilIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || ''
        });
        setIsEditing(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserCircleIcon className="h-16 w-16 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
                    <p className="text-gray-600">Please log in again to access your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600">Manage your account information and preferences</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg">
                        <span className="text-2xl font-bold text-white">
                            {user.name?.charAt(0) || 'A'}
                        </span>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{user.name || 'Admin User'}</h2>
                        <p className="text-gray-500">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <UserCircleIcon className="inline w-4 h-4 mr-1" />
                            Full Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Enter your full name"
                            />
                        ) : (
                            <p className="text-gray-900">{user.name || 'Not provided'}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <EnvelopeIcon className="inline w-4 h-4 mr-1" />
                            Email Address
                        </label>
                        <p className="text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <PhoneIcon className="inline w-4 h-4 mr-1" />
                            Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Enter your phone number"
                            />
                        ) : (
                            <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <ShieldCheckIcon className="inline w-4 h-4 mr-1" />
                            Role
                        </label>
                        <p className="text-gray-900">{user.role === 'super_admin' ? 'Super Admin' : 'Admin'}</p>
                    </div>

                    {/* Created Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <CalendarIcon className="inline w-4 h-4 mr-1" />
                            Member Since
                        </label>
                        <p className="text-gray-900">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                    <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            onClick={handleCancel}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4 mr-2" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <CheckIcon className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage; 