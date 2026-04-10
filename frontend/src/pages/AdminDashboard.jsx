import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Package, ShoppingBag, TrendingUp, ShieldCheck, AlertCircle, ShoppingCart, CheckCircle, XCircle, Clock } from 'lucide-react';

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

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const API_BASE = `http://${window.location.hostname}:5000/api/admin`;
                const [statsRes, usersRes, productsRes, ordersRes] = await Promise.all([
                    fetch(`${API_BASE}/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${API_BASE}/orders`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (!statsRes.ok) throw new Error(`Stats: ${statsRes.statusText}`);
                if (!usersRes.ok) throw new Error(`Users: ${usersRes.statusText}`);
                if (!productsRes.ok) throw new Error(`Products: ${productsRes.statusText}`);
                if (!ordersRes.ok) throw new Error(`Orders: ${ordersRes.statusText}`);

                const statsData = await statsRes.json();
                const usersData = await usersRes.json();
                const productsData = await productsRes.json();
                const ordersData = await ordersRes.json();

                setStats(statsData);
                setUsers(usersData);
                setProducts(productsData);
                setOrders(ordersData);

            } catch (err) {
                console.error('Admin data fetch error:', err);
                setError(`Failed to fetch admin data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, user, navigate]);

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
                        { id: 'sellers', icon: ShoppingBag, label: 'Seller List' }
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
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-100 text-red-600' : u.role === 'seller' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {u.role}
                                                </span>
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

                {activeTab === 'sellers' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Shop Name</th>
                                        <th className="px-6 py-4">Owner</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.filter(u => u.role === 'seller').map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50 transition-colors text-sm">
                                            <td className="px-6 py-4 font-bold text-gray-900">{u.shopName || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-600">{u.username}</td>
                                            <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                            <td className="px-6 py-4 font-mono text-gray-400">{u.phone}</td>
                                            <td className="px-6 py-4">
                                                <button className="text-[10px] font-black text-brand-magenta hover:underline uppercase tracking-wider">
                                                    View Shop
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
