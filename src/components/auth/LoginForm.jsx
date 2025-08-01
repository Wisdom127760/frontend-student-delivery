// components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/Loading';
import { Mail, User } from 'lucide-react';

const LoginForm = () => {
    const { sendOTP, isLoading } = useAuth();
    const [userType, setUserType] = useState('driver');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        await sendOTP(data.email, userType);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User Type Selection */}
            <div className="form-group">
                <label className="form-label">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setUserType('driver')}
                        className={`flex items-center justify-center p-3 border-2 rounded-lg transition-all duration-200 ${userType === 'driver'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        <User className="w-5 h-5 mr-2" />
                        Driver
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType('admin')}
                        className={`flex items-center justify-center p-3 border-2 rounded-lg transition-all duration-200 ${userType === 'admin'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                            }`}
                    >
                        <Mail className="w-5 h-5 mr-2" />
                        Admin
                    </button>
                </div>
            </div>

            {/* Email Input */}
            <div className="form-group">
                <label htmlFor="email" className="form-label">
                    Email Address
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Please enter a valid email address',
                            },
                        })}
                        type="email"
                        id="email"
                        className={`form-input pl-10 ${errors.email ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''
                            }`}
                        placeholder="Enter your email address"
                        disabled={isLoading || isSubmitting}
                    />
                </div>
                {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="btn btn-primary w-full"
            >
                {isLoading || isSubmitting ? (
                    <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sending OTP...
                    </>
                ) : (
                    'Send Verification Code'
                )}
            </button>

            {/* Help Text */}
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    We'll send a 6-digit verification code to your email
                </p>
            </div>
        </form>
    );
};

export default LoginForm;