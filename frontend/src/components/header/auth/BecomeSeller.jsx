import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function BecomeSeller() {
    const navigate = useNavigate();
    const { token, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sellerName, setSellerName] = useState("");
    const [shopName, setShopName] = useState("");
    const [shopLocation, setShopLocation] = useState("");
    const [shopPhone, setShopPhone] = useState("");
    const [documentPhoto, setDocumentPhoto] = useState(null);
    const [businessType, setBusinessType] = useState("");
    const [shopDescription, setShopDescription] = useState("");
    const [idDocumentType, setIdDocumentType] = useState("");
    const [error, setError] = useState("");

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleBecomeSeller = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (!token) {
                navigate("/login");
                return;
            }

            // Comprehensive validation
            if (!sellerName.trim()) {
                setError("Seller name is required");
                setLoading(false);
                return;
            }

            if (sellerName.trim().length < 2) {
                setError("Seller name must be at least 2 characters long");
                setLoading(false);
                return;
            }

            if (!shopName.trim()) {
                setError("Shop name is required");
                setLoading(false);
                return;
            }

            if (shopName.trim().length < 3) {
                setError("Shop name must be at least 3 characters long");
                setLoading(false);
                return;
            }

            if (!shopLocation.trim()) {
                setError("Shop location is required");
                setLoading(false);
                return;
            }

            if (!shopPhone.trim()) {
                setError("Seller phone number is required");
                setLoading(false);
                return;
            }

            if (!documentPhoto) {
                setError("Document photo is required");
                setLoading(false);
                return;
            }

            if (!businessType.trim()) {
                setError("Business type is required");
                setLoading(false);
                return;
            }

            if (!shopDescription.trim()) {
                setError("Shop description is required");
                setLoading(false);
                return;
            }

            if (shopDescription.trim().length < 10) {
                setError("Shop description must be at least 10 characters long");
                setLoading(false);
                return;
            }

            if (!idDocumentType.trim()) {
                setError("ID document type is required");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("sellerName", sellerName);
            formData.append("shopName", shopName);
            formData.append("shopLocation", shopLocation);
            formData.append("shopPhone", shopPhone);
            formData.append("documentPhoto", documentPhoto);
            formData.append("businessType", businessType);
            formData.append("shopDescription", shopDescription);
            formData.append("idDocumentType", idDocumentType);

            const res = await fetch("http://localhost:5000/api/sellers/register", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setIsSubmitted(true);
            } else {
                setError(data.message || "Failed to submit request");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <svg
                            className="w-10 h-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                        Application Sent!
                    </h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Your request to become a seller has been submitted. Our admin team
                        will review your shop details and approve your account shortly.
                    </p>
                    <button
                        onClick={() => navigate("/profile")}
                        className="w-full bg-brand-magenta text-white py-4 rounded-2xl font-bold hover:bg-pink-700 transition-all shadow-lg">
                        Back to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="w-16 h-16 bg-brand-magenta/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-brand-magenta"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                    Become a Seller
                </h1>
                <p className="text-gray-600 mb-8 text-center text-sm">
                    Join our marketplace and start selling your unique products.
                </p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleBecomeSeller}>
                    {/* Seller Name & Shop Name in one row */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seller Name
                            </label>
                            <input
                                type="text"
                                required
                                value={sellerName}
                                onChange={(e) => setSellerName(e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shop Name
                            </label>
                            <input
                                type="text"
                                required
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="e.g. Himalayan Crafts"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Two fields in one row */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shop Location
                            </label>
                            <input
                                type="text"
                                required
                                value={shopLocation}
                                onChange={(e) => setShopLocation(e.target.value)}
                                placeholder="e.g. Thamel, Kathmandu"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seller Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                value={shopPhone}
                                onChange={(e) => setShopPhone(e.target.value)}
                                placeholder="e.g. +9779812345678"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">
                        Phone number will be visible to buyers.
                    </p>

                    {/* Document Verification Fields */}
                    <div className="mb-4 pt-4 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-800 mb-4">
                            Document Verification
                        </label>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Business Type
                                </label>
                                <select
                                    required
                                    value={businessType}
                                    onChange={(e) => setBusinessType(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all bg-white">
                                    <option value="">Select a business type</option>
                                    <option value="Sole Proprietorship">
                                        Sole Proprietorship
                                    </option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Private Limited">Private Limited</option>
                                    <option value="Individual Maker">
                                        Individual Maker (Unregistered)
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    ID Document Type
                                </label>
                                <select
                                    required
                                    value={idDocumentType}
                                    onChange={(e) => setIdDocumentType(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all bg-white">
                                    <option value="">Select ID Document</option>
                                    <option value="Citizenship">Citizenship Card</option>
                                    <option value="Passport">Passport</option>
                                    <option value="National ID">National ID</option>
                                    <option value="Driving License">Driving License</option>
                                </select>
                            </div>
                        </div>

                        {/* Two dropdowns in one row */}
                        <div className="mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Document Photo
                                </label>
                                <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-magenta/20 focus-within:border-brand-magenta transition-all">
                                    <label className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors whitespace-nowrap">
                                        Choose File
                                        <input
                                            type="file"
                                            required
                                            accept="image/*"
                                            onChange={(e) => setDocumentPhoto(e.target.files[0])}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-gray-600 text-sm">
                                        {documentPhoto ? documentPhoto.name : "No file chosen"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Shop Description
                        </label>
                        <textarea
                            required
                            value={shopDescription}
                            onChange={(e) => setShopDescription(e.target.value)}
                            placeholder="Tell us about the art/products you sell..."
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all resize-none"></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-magenta text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70">
                        {loading ? "Processing..." : "Register Shop"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate("/")}
                        className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
