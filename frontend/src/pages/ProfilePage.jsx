import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getImageUrl } from "../utils/imageUtils";
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingBag, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  CreditCard,
  Store
} from "lucide-react";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user: authUser, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      const profileRes = await fetch("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      setProfile(profileData && !profileData.message ? profileData : null);

      // Fetch Orders
      const ordersRes = await fetch("http://localhost:5000/api/orders/myorders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("Error fetching profile data", err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData(e.target);
    const updateData = {
      username: formData.get("username"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: {
        street: formData.get("street"),
        city: formData.get("city"),
        province: formData.get("province"),
      }
    };

    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => ({ ...prev, ...data }));
        updateUser({ ...authUser, ...data });
        alert("Profile updated successfully!");
      }
    } catch (err) {
      alert("Error updating profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/users/profile/image", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (res.ok) {
        setProfile((prev) => {
            const updated = prev ? { ...prev, profileImage: data.profileImage } : { profileImage: data.profileImage };
            updateUser(updated);
            return updated;
        });
        alert("Profile picture updated!");
      } else {
        alert(data?.message || `Upload failed with status: ${res.status}`);
      }
    } catch (err) {
      console.error("Upload Error Details:", err);
      alert("Error uploading image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-light">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-magenta border-t-transparent"></div>
      </div>
    );
  }

  const stats = [
    { label: "Total Orders", value: orders.length, icon: Package, color: "bg-blue-500" },
    { label: "Wishlist Items", value: profile?.wishlist?.length || 0, icon: Heart, color: "bg-pink-500" },
    { label: "Total Spent", value: `Rs. ${orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0).toFixed(0)}`, icon: CreditCard, color: "bg-green-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Banner */}
      <div className="h-48 bg-gradient-to-r from-brand-dark to-brand-magenta relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 text-center border border-white">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl mx-auto bg-brand-light flex items-center justify-center">
                  {profile?.profileImage ? (
                    <img src={getImageUrl(profile.profileImage)} alt="Avatar" className={`w-full h-full object-cover ${uploading ? 'opacity-50' : ''}`} />
                  ) : (
                    <User className="w-16 h-16 text-gray-300" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-magenta text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <h2 className="text-2xl font-serif font-bold text-brand-dark">{profile?.username}</h2>
              <p className="text-gray-500 text-sm mb-6 capitalize">{profile?.role || "Customer"}</p>
              
              <div className="flex flex-col gap-2">
                {[
                  { id: "overview", label: "Overview", icon: ShoppingBag },
                  { id: "orders", label: "My Orders", icon: Package },
                  { id: "wishlist", label: "Wishlist", icon: Heart },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                      activeTab === tab.id 
                        ? "bg-brand-magenta text-white shadow-lg shadow-brand-magenta/20" 
                        : "text-gray-500 hover:bg-brand-light hover:text-brand-magenta"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
                <button 
                  onClick={() => {
                      logout();
                      navigate("/");
                  }}
                  className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-brand-dark rounded-3xl p-6 text-white shadow-xl">
               <div className="flex items-center gap-3 mb-4 text-brand-magenta">
                  <ShieldCheck className="w-6 h-6" />
                  <span className="font-bold">Account Verified</span>
               </div>
               <p className="text-xs text-white/60 leading-relaxed">
                  Your account is protected with 2FA and secure encryption. Your data privacy is our priority.
               </p>
            </div>

            {/* Want to Sell Card – handling pending/rejected/none statuses */}
            {profile?.role === 'user' && (
              <div className="bg-gradient-to-br from-brand-magenta to-pink-700 rounded-3xl p-6 text-white shadow-xl">
                {profile?.sellerStatus === 'pending' ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                        <Store className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-lg">Pending Approval</span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">
                      Your seller request is being reviewed by our admins. You'll be notified once you're approved to start selling!
                    </p>
                  </>
                ) : profile?.sellerStatus === 'rejected' ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <Store className="w-6 h-6 text-red-200" />
                      <span className="font-bold text-lg">Application Rejected</span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed mb-4">
                      Sorry, your recent seller application was not approved. You can try updating your details and applying again.
                    </p>
                    <button
                      onClick={() => navigate('/become-seller')}
                      className="w-full py-2.5 bg-white/20 text-white border border-white/50 font-bold rounded-2xl hover:bg-white/30 transition-all text-sm shadow-lg"
                    >
                      Re-apply Now
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <Store className="w-6 h-6" />
                      <span className="font-bold text-lg">Want to Sell?</span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed mb-4">
                      Join hundreds of artists on KalaMala. Start your seller journey today and reach thousands of art lovers.
                    </p>
                    <button
                      onClick={() => navigate('/become-seller')}
                      className="w-full py-2.5 bg-white text-brand-magenta font-bold rounded-2xl hover:bg-brand-light transition-all text-sm shadow-lg"
                    >
                      Become a Seller →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gray/50 flex items-center gap-4">
                      <div className={`${s.color} p-3 rounded-2xl text-white shadow-lg`}>
                        <s.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.label}</p>
                        <p className="text-2xl font-bold text-brand-dark">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Profile Details */}
                <div className="bg-white rounded-3xl shadow-sm border border-brand-gray/50 overflow-hidden">
                  <div className="p-8 border-b border-brand-gray/50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-brand-dark font-serif">Personal Information</h3>
                    <button 
                         onClick={() => setActiveTab("settings")}
                         className="text-brand-magenta text-sm font-bold hover:underline"
                    >
                        Edit Profile
                    </button>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                      <div className="bg-brand-light p-3 rounded-2xl h-fit">
                        <Mail className="w-5 h-5 text-brand-magenta" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold mb-1">Email Address</p>
                        <p className="text-brand-dark font-medium">{profile?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-brand-light p-3 rounded-2xl h-fit">
                        <Phone className="w-5 h-5 text-brand-magenta" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold mb-1">Phone Number</p>
                        <p className="text-brand-dark font-medium">{profile?.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 md:col-span-2">
                      <div className="bg-brand-light p-3 rounded-2xl h-fit">
                        <MapPin className="w-5 h-5 text-brand-magenta" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold mb-1">Delivery Address</p>
                        <p className="text-brand-dark font-medium">
                          {profile?.address?.street ? 
                            `${profile.address.street}, ${profile.address.city}, ${profile.address.province}` 
                            : "No address set yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="bg-white rounded-3xl shadow-sm border border-brand-gray/50 overflow-hidden">
                   <div className="p-8 border-b border-brand-gray/50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-brand-dark font-serif">Recent Orders</h3>
                    <button 
                        onClick={() => setActiveTab("orders")}
                        className="text-gray-400 hover:text-brand-magenta transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-0">
                    {(orders || []).slice(0, 3).map((order) => (
                      <div key={order._id} className="p-6 border-b border-brand-gray/50 hover:bg-brand-light/50 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center">
                              <Package className="w-6 h-6 text-brand-magenta" />
                           </div>
                           <div>
                              <p className="font-bold text-brand-dark">Order #{order._id?.slice(-6).toUpperCase() || 'N/A'}</p>
                              <p className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-bold text-brand-dark">Rs. {order.totalPrice}</p>
                           <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                           </span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="p-10 text-center text-gray-400">No orders found</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
                <div className="animate-fade-in space-y-6">
                     <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6">Your Order History</h3>
                     <div className="grid grid-cols-1 gap-6">
                        {(orders || []).map((order) => (
                            <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-brand-gray/50 overflow-hidden group hover:border-brand-magenta/30 transition-all">
                                <div className="p-6 border-b border-brand-gray/50 bg-brand-light/20 flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Order Placed</p>
                                        <p className="text-brand-dark font-medium">{order.createdAt ? new Date(order.createdAt).toDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Total Amount</p>
                                        <p className="text-brand-magenta font-bold">Rs. {order.totalPrice}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Status</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.isPaid ? 'Complete' : 'Processing'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Order ID</p>
                                        <p className="text-brand-dark font-mono text-xs">{order._id}</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {(order.orderItems || []).map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center py-3 first:pt-0 last:pb-0 border-b last:border-0 border-brand-gray/20">
                                            <img src={getImageUrl(item.image)} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-brand-dark text-sm">{item.name}</h4>
                                                <p className="text-xs text-gray-400">Quantity: {item.qty}</p>
                                            </div>
                                            <div className="font-bold text-brand-dark text-sm">Rs. {((item.price || 0) * (item.qty || 0)).toFixed(0)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="p-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
                                <button
                                    onClick={() => navigate("/")}
                                    className="mt-6 text-brand-magenta font-bold hover:underline"
                                >
                                    Start Shopping &rarr;
                                </button>
                            </div>
                        )}
                     </div>
                </div>
            )}

            {activeTab === "wishlist" && (
                <div className="animate-fade-in">
                     <h3 className="text-2xl font-serif font-bold text-brand-dark mb-8">My Wishlist</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profile?.wishlist?.filter(p => p !== null).map((product) => (
                            <div key={product._id} className="bg-white rounded-3xl shadow-sm border border-brand-gray/50 overflow-hidden group">
                                <div className="aspect-square relative overflow-hidden">
                                     <img src={getImageUrl(product.images?.[0] || product.image)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                     <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm text-brand-magenta rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                                        <Heart className="w-4 h-4 fill-brand-magenta" />
                                     </button>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-bold text-brand-dark mb-1 truncate">{product.name}</h4>
                                    <p className="text-brand-magenta font-bold mb-4">Rs. {product.price}</p>
                                    <button 
                                        onClick={() => navigate(`/products/${product._id}`)}
                                        className="w-full py-3 bg-brand-light text-brand-magenta font-bold rounded-2xl hover:bg-brand-magenta hover:text-white transition-all text-sm"
                                    >
                                        View Product
                                    </button>
                                </div>
                            </div>
                        ))}
                        {(!profile?.wishlist || profile.wishlist.length === 0) && (
                            <div className="col-span-full p-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Your wishlist is empty.</p>
                                <button
                                    onClick={() => navigate("/")}
                                    className="mt-6 text-brand-magenta font-bold hover:underline"
                                >
                                    Explore Artistic Treasures &rarr;
                                </button>
                            </div>
                        )}
                     </div>
                </div>
            )}

            {activeTab === "settings" && (
                <div className="animate-fade-in space-y-8">
                     <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6">Account Settings</h3>
                     
                     <div className="bg-white rounded-3xl shadow-sm border border-brand-gray/50 overflow-hidden">
                        <div className="p-8 border-b border-brand-gray/50">
                            <h4 className="font-bold text-lg text-brand-dark">Update Profile</h4>
                            <p className="text-gray-400 text-sm">Update your information and address for better deliveries.</p>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Username</label>
                                    <input 
                                        type="text" 
                                        name="username" 
                                        defaultValue={profile?.username}
                                        className="w-full px-4 py-3 bg-brand-light rounded-xl border border-brand-gray/50 focus:ring-2 focus:ring-brand-magenta outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        defaultValue={profile?.email}
                                        className="w-full px-4 py-3 bg-brand-light rounded-xl border border-brand-gray/50 focus:ring-2 focus:ring-brand-magenta outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        defaultValue={profile?.phone}
                                        className="w-full px-4 py-3 bg-brand-light rounded-xl border border-brand-gray/50 focus:ring-2 focus:ring-brand-magenta outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Shipping Address</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-3">
                                        <input 
                                            type="text" 
                                            name="street" 
                                            defaultValue={profile?.address?.street}
                                            placeholder="Street & House No."
                                            className="w-full px-4 py-3 bg-brand-light rounded-xl border border-brand-gray/50 focus:ring-2 focus:ring-brand-magenta outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="text" 
                                            name="city" 
                                            defaultValue={profile?.address?.city}
                                            placeholder="City"
                                            className="w-full px-4 py-3 bg-brand-light rounded-xl border border-brand-gray/50 focus:ring-2 focus:ring-brand-magenta outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="text" 
                                            name="province" 
                                            defaultValue={profile?.address?.province}
                                            placeholder="Province"
                                            className="w-full px-4 py-3 bg-brand-light rounded-xl border border-brand-gray/50 focus:ring-2 focus:ring-brand-magenta outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={updating}
                                    className="px-8 py-3 bg-brand-magenta text-white font-bold rounded-2xl shadow-lg shadow-brand-magenta/20 hover:-translate-y-1 transition-all disabled:opacity-50"
                                >
                                    {updating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                     </div>

                     <div className="bg-red-50 rounded-3xl p-8 border border-red-100 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-red-600">Danger Zone</h4>
                            <p className="text-red-400 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
                        </div>
                        <button className="px-6 py-3 border-2 border-red-500 text-red-500 font-bold rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                            Delete Account
                        </button>
                     </div>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
