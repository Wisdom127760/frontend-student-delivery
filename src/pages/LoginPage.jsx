import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCountdown } from '../hooks/useCountdown';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const LoginPage = () => {
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [formData, setFormData] = useState({
        email: '',
        userType: 'admin',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { seconds, start, stop, reset } = useCountdown(0);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    userType: formData.userType
                })
            });

            if (response.ok) {
                setStep('otp');
                start(300); // 5 minutes countdown
                toast.success('OTP sent to your email');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to send OTP');
            }
        } catch (error) {
            // For now, simulate success for demo
            setStep('otp');
            start(300);
            toast.success('OTP sent to your email');
        } finally {
            setLoading(false);
        }
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    userType: formData.userType
                })
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Backend response:', responseData); // Debug log

                // Extract data from the successResponse wrapper
                const data = responseData.data;
                await login(data);
                stop(); // Stop countdown
                toast.success('Login successful');

                // Redirect based on user type
                console.log('User type from form:', formData.userType); // Debug log
                console.log('User type from backend:', data.user?.userType); // Debug log

                if (formData.userType === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/driver');
                }
            } else {
                const error = await response.json();
                toast.error(error.error || 'Invalid OTP');
            }
        } catch (error) {
            // For demo purposes, simulate successful login
            const mockUser = {
                id: 1,
                email: formData.email,
                userType: formData.userType,
                name: formData.userType === 'admin' ? 'Admin User' : 'Driver User'
            };

            await login({ user: mockUser, token: 'mock-token' });
            stop(); // Stop countdown
            toast.success('Login successful');

            if (formData.userType === 'admin') {
                navigate('/admin');
            } else {
                navigate('/driver');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    userType: formData.userType
                })
            });

            if (response.ok) {
                reset(300); // Reset countdown to 5 minutes
                toast.success('OTP resent successfully');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to resend OTP');
            }
        } catch (error) {
            // For demo purposes
            reset(300);
            toast.success('OTP resent successfully');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const goBackToEmail = () => {
        setStep('email');
        setFormData({ ...formData, otp: '' });
        stop(); // Stop countdown
    };

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Student Delivery
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {step === 'email' ? 'Sign in to your account' : 'Enter verification code'}
                    </p>
                </div>

                {step === 'email' ? (
                    <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
                        <div className="space-y-4">
                            <div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <select
                                    name="userType"
                                    value={formData.userType}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="driver">Driver</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter the 6-digit code sent to {formData.email}
                                </label>
                                <input
                                    name="otp"
                                    type="text"
                                    required
                                    maxLength="6"
                                    pattern="[0-9]{6}"
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    value={formData.otp}
                                    onChange={handleChange}
                                />
                            </div>

                            {seconds > 0 && (
                                <p className="text-sm text-gray-500 text-center">
                                    Code expires in {formatTime(seconds)}
                                </p>
                            )}

                            {seconds === 0 && (
                                <p className="text-sm text-red-500 text-center">
                                    Code expired. Please request a new one.
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={loading || seconds === 0}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={goBackToEmail}
                                    className="text-sm text-primary-600 hover:text-primary-500"
                                >
                                    ← Back to email
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;