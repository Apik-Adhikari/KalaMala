import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BecomeSeller() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [shopName, setShopName] = useState('');
    const [shopLocation, setShopLocation] = useState('');
    const [shopPhone, setShopPhone] = useState('');
    const [error, setError] = useState('');

    const handleBecomeSeller = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            if (shopName.trim().length < 3) {
                setError('Shop name must be at least 3 characters long');
                setLoading(false);
                return;
            }

            const res = await fetch('http://localhost:5000/api/sellers/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shopName, shopLocation, shopPhone })
            });

            const data = await res.json();
            if (res.ok) {
                // Update local storage with new role and shop name
                localStorage.setItem('user', JSON.stringify({
                    _id: data._id,
                    name: data.username,
                    email: data.email,
                    role: data.role,
                    shopName: data.shopName,
                    shopLocation: data.shopLocation,
                    shopPhone: data.shopPhone
                }));
                // Update token if it was refreshed
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                // Show success message
                alert('Seller added successfully!');
                navigate('/');
                window.location.reload();
            } else {
                setError(data.message || 'Failed to update role');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="w-16 h-16 bg-brand-magenta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-magenta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Become a Seller</h1>
                <p className="text-gray-600 mb-8 text-center text-sm">
                    Join our marketplace and start selling your unique products.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleBecomeSeller}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                        <input
                            type="text"
                            required
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder="e.g. Himalayan Crafts"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Shop Location</label>
                        <input
                            type="text"
                            required
                            value={shopLocation}
                            onChange={(e) => setShopLocation(e.target.value)}
                            placeholder="e.g. Thamel, Kathmandu"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Seller Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={shopPhone}
                            onChange={(e) => setShopPhone(e.target.value)}
                            placeholder="e.g. +9779812345678"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-2">This number will be visible to buyers.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-magenta text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70"
                    >
                        {loading ? 'Processing...' : 'Register Shop'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
