import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const { token, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            fetchNotifications();
            // Optional: Poll for new notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [token]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/users/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/users/notifications/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-brand-magenta transition-colors focus:outline-none group"
            >
                <Bell size={24} className={unreadCount > 0 ? "animate-swing" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-brand-magenta text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Notifications</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <Info className="mx-auto text-gray-200 mb-3" size={40} />
                                <p className="text-gray-400 text-sm italic">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((note) => (
                                    <div 
                                        key={note._id} 
                                        className={`p-4 transition-colors hover:bg-gray-50 relative group ${!note.isRead ? 'bg-brand-light/10' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!note.isRead ? 'bg-brand-magenta' : 'bg-transparent'}`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-xs font-black uppercase tracking-tight ${note.type === 'removal' ? 'text-red-600' : 'text-gray-900'}`}>
                                                        {note.title}
                                                    </h4>
                                                    {!note.isRead && (
                                                        <button 
                                                            onClick={() => markAsRead(note._id)}
                                                            className="text-brand-magenta opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Mark as read"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className={`text-xs leading-relaxed ${note.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {note.message}
                                                </p>
                                                {note.relatedProduct && (
                                                  <div className="mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Item: {note.relatedProduct}
                                                  </div>
                                                )}
                                                <p className="mt-2 text-[9px] text-gray-300 font-medium">
                                                    {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(note.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {user.role === 'seller' && (
                        <button 
                            onClick={() => { navigate('/seller-dashboard'); setIsOpen(false); }}
                            className="w-full py-4 text-xs font-black text-brand-magenta hover:bg-brand-magenta hover:text-white transition-all uppercase tracking-widest border-t border-gray-50"
                        >
                            View Seller Dashboard
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
