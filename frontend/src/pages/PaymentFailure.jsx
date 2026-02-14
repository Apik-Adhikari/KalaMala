import React from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFailure() {
    const navigate = useNavigate();

    return (
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl shadow-xl border border-red-100 text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Payment Cancelled</h2>
            <p className="text-gray-600 mb-8">It seems like the payment process was cancelled or failed. Your cart items are still safe.</p>
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/cart')}
                    className="w-full bg-brand-magenta text-white py-4 rounded-xl font-bold hover:bg-pink-700 transition"
                >
                    Try Again
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full border-2 border-brand-dark text-brand-dark py-3.5 rounded-xl font-bold hover:bg-brand-dark hover:text-white transition"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}
