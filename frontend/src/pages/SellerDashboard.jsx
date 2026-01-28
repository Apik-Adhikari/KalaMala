import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SellerDashboard() {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'seller') {
            navigate('/become-seller');
            return;
        }

        fetchMyProducts(user._id);
    }, [user, navigate]);

    const fetchMyProducts = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/products?seller=${userId}`);
            const data = await res.json();
            if (res.ok) {
                setProducts(data);
            } else {
                setError('Failed to fetch products');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
            } else {
                alert('Failed to delete product');
            }
        } catch (err) {
            alert('Error deleting product');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">Seller Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back, <span className="font-semibold text-brand-magenta">{user?.name}</span>
                            {user?.shopName && <span className="text-gray-500"> • {user.shopName}</span>}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/add-product')}
                        className="flex items-center gap-2 bg-brand-magenta text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Product
                    </button>
                </div>

                {/* Stats/Overview (Placeholder) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Products</p>
                                <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
                            </div>
                        </div>
                    </div>
                    {/* Additional stats can go here */}
                </div>

                {/* Products List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">My Products</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading products...</div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-500">{error}</div>
                    ) : products.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first product to the marketplace.</p>
                            <button
                                onClick={() => navigate('/add-product')}
                                className="text-brand-magenta font-bold hover:underline"
                            >
                                Add your first product
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Product</th>
                                        <th className="px-6 py-4 font-medium">Price</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">Stock</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                                    />
                                                    <span className="font-medium text-gray-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">NPR {product.price}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                    {product.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-medium ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/edit-product/${product._id}`)} // Use navigate with ID
                                                        className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
