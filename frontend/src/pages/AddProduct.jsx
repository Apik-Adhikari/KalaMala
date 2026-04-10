import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PRODUCT_CATEGORIES } from '../constants/categories';

export default function AddProduct() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        images: [null, null, null, null, null], // 5 image slots
        category: PRODUCT_CATEGORIES[0], // Set default category
        countInStock: '',
        featured: true
    });

    const handleImageChange = (idx, file) => {
        if (file && file.size > 2 * 1024 * 1024) {
            setError(`Image ${file.name} is too large. Max size is 2 MB.`);
            // Do not update the image slot if file is too large
            return;
        }
        setError('');
        const newImages = [...formData.images];
        newImages[idx] = file;
        setFormData({ ...formData, images: newImages });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // At least one image is required
        if (!formData.images[0]) {
            setError('At least one product image is required.');
            setLoading(false);
            return;
        }

        try {
            if (!token) {
                navigate('/login');
                return;
            }

            const form = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'images') {
                    value.forEach((file) => {
                        if (file) form.append('images', file);
                    });
                } else {
                    form.append(key, value);
                }
            });

            const res = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });

            const data = await res.json();
            if (res.ok) {
                navigate('/products');
            } else {
                setError(data.message || 'Failed to add product');
            }
        } catch (err) {
            console.error('Add product error:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-brand-magenta py-6 px-8">
                    <h1 className="text-2xl font-bold text-white">Add New Product</h1>
                    <p className="text-pink-100 mt-1">Fill in the details to list your product</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                                placeholder="e.g. Handmade Woolen Hat"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Count In Stock</label>
                                <input
                                    type="number"
                                    name="countInStock"
                                    required
                                    min="0"
                                    value={formData.countInStock}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all"
                                    placeholder="Available quantity"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all bg-white"
                            >
                                {PRODUCT_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {[0, 1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required={idx === 0}
                                            onChange={e => handleImageChange(idx, e.target.files[0])}
                                            className="px-2 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all bg-white"
                                        />
                                        {formData.images[idx] && (
                                            <img
                                                src={URL.createObjectURL(formData.images[idx])}
                                                alt={`preview-${idx}`}
                                                className="w-20 h-20 object-cover rounded border border-gray-200 shadow mt-2"
                                            />
                                        )}
                                        <span className="text-xs text-gray-500 mt-1">
                                            {idx === 0 ? 'Required' : 'Optional'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">First image is required, others are optional.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-magenta/20 focus:border-brand-magenta outline-none transition-all resize-none"
                                placeholder="Describe your product..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-brand-magenta text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-brand-magenta/20 disabled:opacity-70"
                        >
                            {loading ? 'Adding Product...' : 'Listed Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
