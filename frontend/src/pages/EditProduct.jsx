import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import { getImageUrl } from '../utils/imageUtils';

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        images: [null, null, null, null, null],
        category: '',
        countInStock: '',
        featured: false
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`);
                const data = await res.json();
                if (res.ok) {
                    // Normalize images to 5 slots
                    let productImages = data.images || [];
                    if (productImages.length === 0 && data.image) {
                        productImages = [data.image];
                    }
                    const initialImages = [...productImages];
                    while (initialImages.length < 5) initialImages.push(null);

                    setFormData({
                        name: data.name,
                        price: data.price,
                        description: data.description,
                        images: initialImages.slice(0, 5),
                        category: data.category || PRODUCT_CATEGORIES[0],
                        countInStock: data.countInStock,
                        featured: data.featured || false
                    });
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                setError('Error fetching product');
            } finally {
                setFetchLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleImageChange = (idx, file) => {
        if (file && file.size > 2 * 1024 * 1024) {
            setError(`Image ${file.name} is too large. Max size is 2 MB.`);
            return;
        }
        setError('');
        const newImages = [...formData.images];
        newImages[idx] = file;
        setFormData({ ...formData, images: newImages });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!token) {
                navigate('/login');
                return;
            }

            if (!id) {
                setError('Product ID is missing');
                return;
            }

            console.log('Starting upload for product:', id);
            console.log('Current formData state:', formData);

            const form = new FormData();
            
            // Collect metadata for image ordering
            const imageOrder = [];
            let fileCount = 0;
            const filesToAppend = [];

            formData.images.forEach((img, index) => {
                // More robust check for File objects
                if (img && typeof img === 'object' && img.name && img.size) {
                    filesToAppend.push(img);
                    imageOrder.push(`FILE_${fileCount++}`);
                    console.log(`Slot ${index}: New file detected - ${img.name}`);
                } else if (typeof img === 'string' && img.length > 0) {
                    imageOrder.push(img);
                    console.log(`Slot ${index}: Keeping existing image - ${img}`);
                } else {
                    imageOrder.push(null);
                    console.log(`Slot ${index}: Empty`);
                }
            });

            // 1. Append text fields first
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'images' && key !== 'image') {
                    form.append(key, value);
                }
            });
            form.append('imageOrder', JSON.stringify(imageOrder));
            console.log('Final imageOrder:', imageOrder);
            console.log('Number of new files to upload:', filesToAppend.length);

            // 2. Append files last
            filesToAppend.forEach(file => {
                form.append('images', file);
            });

            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error('Server returned non-JSON response:', text);
                throw new Error('Server returned an unexpected response format');
            }

            console.log('Server response:', data);

            if (res.ok) {
                alert('Product updated successfully!');
                navigate('/seller-dashboard');
            } else {
                setError(data.message || 'Failed to update product');
            }
        } catch (err) {
            console.error('Update product error:', err);
            setError(err.message || 'An error occurred during update');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-magenta"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-brand-magenta py-6 px-8">
                    <h1 className="text-2xl font-bold text-white">Edit Product</h1>
                    <p className="text-pink-100 mt-1">Update your product details and images</p>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[0, 1, 2, 3, 4].map((idx) => (
                                    <div key={idx} className="flex flex-col p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Slot {idx + 1} {idx === 0 && <span className="text-brand-magenta">*</span>}</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => handleImageChange(idx, e.target.files[0])}
                                            className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-magenta file:text-white hover:file:bg-pink-700 cursor-pointer"
                                        />
                                        {formData.images[idx] && (
                                            <div className="mt-2 relative group">
                                                <img
                                                    src={formData.images[idx] instanceof File ? URL.createObjectURL(formData.images[idx]) : getImageUrl(formData.images[idx])}
                                                    alt={`preview-${idx}`}
                                                    className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">Replace Image</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Uploading new images will replace the existing ones in these slots.</p>
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
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/seller-dashboard')}
                            className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-brand-magenta text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg shadow-brand-magenta/20 disabled:opacity-70"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
