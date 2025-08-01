import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const TrackDelivery = () => {
    const { deliveryCode } = useParams();
    const [trackingCode, setTrackingCode] = useState(deliveryCode || '');
    const [deliveryStatus, setDeliveryStatus] = useState(null);

    const handleTrack = (e) => {
        e.preventDefault();
        // TODO: Implement actual tracking logic
        setDeliveryStatus({
            code: trackingCode,
            status: 'In Transit',
            location: 'Distribution Center',
            estimatedDelivery: '2 hours'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Track Delivery</h1>
                    <p className="text-gray-600">Enter your tracking code to check delivery status</p>
                </div>

                <form onSubmit={handleTrack} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value)}
                            placeholder="Enter tracking code"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Track Delivery
                    </button>
                </form>

                {deliveryStatus && (
                    <div className="mt-8 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Status</h3>
                        <div className="space-y-3">
                            <p><strong>Code:</strong> {deliveryStatus.code}</p>
                            <p><strong>Status:</strong> {deliveryStatus.status}</p>
                            <p><strong>Location:</strong> {deliveryStatus.location}</p>
                            <p><strong>Estimated Delivery:</strong> {deliveryStatus.estimatedDelivery}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackDelivery;
