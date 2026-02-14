import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyPayment = async () => {
            const dataParam = searchParams.get('data');
            if (!dataParam) {
                setError("Missing payment data");
                setLoading(false);
                return;
            }

            try {
                // Decode the base64 data to get transaction_uuid (orderId)
                const decodedBody = JSON.parse(atob(dataParam));
                const orderId = decodedBody.transaction_uuid;

                const res = await fetch(`http://localhost:5000/api/orders/${orderId}/verify?data=${dataParam}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    // Clear cart
                    localStorage.removeItem('cart');
                    window.dispatchEvent(new CustomEvent('cart-updated'));
                    setLoading(false);
                } else {
                    const errData = await res.json();
                    setError(errData.message || "Verification failed");
                    setLoading(false);
                }
            } catch (err) {
                setError("Invalid response from payment gateway");
                setLoading(false);
            }
        };

        if (token) {
            verifyPayment();
        }
    }, [searchParams, token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-magenta"></div>
                <p className="text-gray-500 font-medium">Verifying your payment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl shadow-xl border border-red-100 text-center">
                <div className="text-6xl mb-6">❌</div>
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Payment Verification Failed</h2>
                <p className="text-gray-600 mb-8">{error}</p>
                <button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-brand-magenta text-white py-4 rounded-xl font-bold hover:bg-pink-700 transition"
                >
                    Return to Cart
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl shadow-xl border border-green-100 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been placed and is being processed.</p>
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-black transition"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}
