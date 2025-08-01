// components/common/Loading.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({
    size = 'md',
    text = 'Loading...',
    fullScreen = false,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
    };

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center">
                    <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin mx-auto mb-4`} />
                    <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
                        {text}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center p-8 ${className}`}>
            <div className="text-center">
                <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin mx-auto mb-2`} />
                <p className={`${textSizeClasses[size]} text-gray-600`}>
                    {text}
                </p>
            </div>
        </div>
    );
};

// Inline loading spinner (for buttons, etc.)
export const LoadingSpinner = ({ size = 'sm', className = '' }) => {
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
    );
};

// Loading skeleton for content
export const LoadingSkeleton = ({ className = '', lines = 3 }) => {
    return (
        <div className={`animate-pulse ${className}`}>
            {Array.from({ length: lines }, (_, i) => (
                <div
                    key={i}
                    className={`bg-gray-200 rounded h-4 mb-3 ${i === lines - 1 ? 'w-3/4' : 'w-full'
                        }`}
                />
            ))}
        </div>
    );
};

// Loading card
export const LoadingCard = ({ className = '' }) => {
    return (
        <div className={`card animate-pulse ${className}`}>
            <div className="card-body">
                <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 w-12 h-12"></div>
                    <div className="flex-1 space-y-2">
                        <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                        <div className="bg-gray-200 rounded h-3 w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loading;