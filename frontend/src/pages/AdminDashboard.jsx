import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingBag, TrendingUp, ShieldCheck, AlertCircle, ShoppingCart, CheckCircle, XCircle, Clock, Calendar, Layout, Trash2, Send } from 'lucide-react';
import { LineChart, BarChart, CategoryDoughnut } from '../components/views/ChartDashboard.jsx';

export default function AdminDashboard() {
    const { token, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [removingProduct, setRemovingProduct] = useState(null);
    const [removalReason, setRemovalReason] = useState('');
    const [sellerRequests, setSellerRequests] = useState([]);
    const [verifyingSellerId, setVerifyingSellerId] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const API_BASE = `http://${window.location.hostname}:5000/api/admin`;
                const [statsRes, usersRes, productsRes, ordersRes, requestsRes] = await Promise.all([
                    fetch(`${API_BASE}/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`http://localhost:5000/api/sellers/requests`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!statsRes.ok) throw new Error(`Stats: ${statsRes.statusText}`);
                if (!usersRes.ok) throw new Error(`Users: ${usersRes.statusText}`);
                if (!productsRes.ok) throw new Error(`Products: ${productsRes.statusText}`);
                if (!ordersRes.ok) throw new Error(`Orders: ${ordersRes.statusText}`);

                const statsData = await statsRes.json();
                const usersData = await usersRes.json();
                const productsData = await productsRes.json();
                const ordersData = await ordersRes.json();
                const requestsData = requestsRes.ok ? await requestsRes.json() : [];

                setStats(statsData);
                setUsers(usersData);
                setProducts(productsData);
                setOrders(ordersData);
                setSellerRequests(requestsData);

            } catch (err) {
                console.error('Admin data fetch error:', err);
                setError(`Failed to fetch admin data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, user, navigate]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
                alert('User role updated successfully!');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update role');
            }
        } catch (err) {
            alert('Error updating user role');
        }
    };

    const handleVerifySeller = async (id, status) => {
        setVerifyingSellerId(id);
        try {
            const res = await fetch(`http://localhost:5000/api/sellers/verify/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                setSellerRequests(sellerRequests.filter(r => r._id !== id));
                alert(`Seller ${status} successfully!`);
                // Reload users if approved, since role has changed
                if (status === 'approved') {
                    const usersRes = await fetch(`http://localhost:5000/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
                    const usersData = await usersRes.json();
                    setUsers(usersData);
                }
            } else {
                const data = await res.json();
                alert(data.message || 'Verification failed');
            }
        } catch (err) {
            alert('Error verifying seller');
        } finally {
            setVerifyingSellerId(null);
        }
    };

    const handleRemoveProduct = async () => {
        if (!removingProduct) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/products/${removingProduct._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: removalReason })
            });

            if (res.ok) {
                setProducts(products.filter(p => p._id !== removingProduct._id));
                setRemovingProduct(null);
                setRemovalReason('');
                alert('Product removed and seller notified.');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to remove product');
            }
        } catch (err) {
            alert('Error removing product');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-magenta"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-dark text-white fixed h-full transition-all">
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-brand-yellow" />
                        Super Admin
                    </h1>
                </div>
                <nav className="p-4 space-y-2">
                    {[
                        { id: 'overview', icon: TrendingUp, label: 'Overview' },
                        { id: 'users', icon: Users, label: 'Manage Users' },
                        { id: 'products', icon: Package, label: 'Manage Products' },
                        { id: 'orders', icon: ShoppingCart, label: 'All Orders' },
                        { id: 'requests', icon: ShieldCheck, label: 'Seller Requests' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-brand-magenta text-white shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 capitalize">{activeTab}</h2>
                        <p className="text-gray-500 text-sm mt-1">Platform monitoring and management dashboard</p>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {activeTab === 'overview' && stats && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Total Users', value: stats.stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                                { label: 'Active Products', value: stats.stats.products, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
                                { label: 'Total Orders', value: stats.stats.orders, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-100' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
                                    </div>
                                    <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={28} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-brand-light rounded-xl">
                                            <Calendar className="text-brand-magenta w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">User Registrations</h3>
                                            <p className="text-xs text-gray-400 font-medium">Daily signup trends (Last 7 Days)</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-[300px]">
                                    <LineChart data={stats.stats.dailyRegs || []} label="New Users" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-brand-light rounded-xl">
                                        <Layout className="text-brand-magenta w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Stock by Category</h3>
                                </div>
                                <div className="h-[300px]">
                                    <CategoryDoughnut data={stats.stats.categoryDistribution || []} />
                                </div>
                            </div>
                        </div>

                        {/* Recent Orders Overview */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Total</th>
                                            <th className="px-6 py-4">Paid</th>
                                            <th className="px-6 py-4">Delivered</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.slice(0, 5).map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-gray-400">#{order._id.slice(-6)}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{order.user?.username || 'Guest'}</td>
                                                <td className="px-6 py-4 text-sm font-black text-brand-magenta">Rs. {order.totalPrice}</td>
                                                <td className="px-6 py-4">
                                                    {order.isPaid ?
                                                        <CheckCircle size={16} className="text-green-500" /> :
                                                        <XCircle size={16} className="text-red-400" />
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    {order.isDelivered ?
                                                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded">YES</span> :
                                                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">NO</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900">{u.username}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                    className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none focus:ring-2 focus:ring-brand-magenta transition-all ${u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'seller' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="seller">Seller</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Product Name</th>
                                        <th className="px-6 py-4">Seller</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((p) => (
                                        <tr key={p._id} className="hover:bg-gray-50 transition-colors text-sm">
                                            <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{p.seller?.shopName || p.seller?.username || 'System'}</td>
                                            <td className="px-6 py-4 text-brand-magenta font-black">Rs. {p.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${p.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {p.countInStock}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setRemovingProduct(p)}
                                                    className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                                                    title="Remove Product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Items</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors text-sm">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order._id}</td>
                                            <td className="px-6 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{order.user?.username}</div>
                                                <div className="text-[10px] text-gray-400">{order.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{order.orderItems?.length || 0}</td>
                                            <td className="px-6 py-4 text-brand-magenta font-black">Rs. {order.totalPrice}</td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {order.isPaid ? <CheckCircle size={12} className="text-green-500" /> : <Clock size={12} className="text-orange-400" />}
                                                    <span className={`text-[10px] font-bold ${order.isPaid ? 'text-green-700' : 'text-orange-700'}`}>
                                                        {order.isPaid ? 'PAID' : 'PENDING'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {order.isDelivered ? <CheckCircle size={12} className="text-green-500" /> : <Clock size={12} className="text-blue-400" />}
                                                    <span className={`text-[10px] font-bold ${order.isDelivered ? 'text-green-700' : 'text-blue-700'}`}>
                                                        {order.isDelivered ? 'DELIVERED' : 'SHIPPING'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Shop Details</th>
                                        <th className="px-6 py-4">Applicant</th>
                                        <th className="px-6 py-4">Business Info</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sellerRequests.map((req) => (
                                        <tr key={req._id} className="hover:bg-gray-50 transition-colors text-sm">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{req.shopName}</div>
                                                <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{req.shopLocation}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{req.user?.fullName}</div>
                                                <div className="text-[10px] text-brand-magenta">{req.idDocumentType}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-600">{req.businessType}</div>
                                                <div className="text-[10px] font-mono text-gray-400">ID: {req.businessRegistrationNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-gray-400 text-xs">{req.shopPhone}</td>
                                            <td className="px-6 py-4 flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleVerifySeller(req._id, 'approved')}
                                                    disabled={verifyingSellerId === req._id}
                                                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-green-600 disabled:opacity-50"
                                                >
                                                    <CheckCircle size={14} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleVerifySeller(req._id, 'rejected')}
                                                    disabled={verifyingSellerId === req._id}
                                                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-red-600 disabled:opacity-50"
                                                >
                                                    <XCircle size={14} />
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {sellerRequests.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-medium">No pending seller requests</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Removal Modal */}
                {removingProduct && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-8">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Remove Product?</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    You are about to remove <span className="font-bold text-gray-900">"{removingProduct.name}"</span>.
                                    Please provide a reason so we can notify the seller.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reason for Removal</label>
                                        <textarea
                                            value={removalReason}
                                            onChange={(e) => setRemovalReason(e.target.value)}
                                            placeholder="e.g., Copyright violation, Inappropriate content, Counterfeit item..."
                                            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 h-32 resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setRemovingProduct(null)}
                                            className="flex-1 px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRemoveProduct}
                                            disabled={!removalReason.trim()}
                                            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={18} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );

}