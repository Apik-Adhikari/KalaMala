import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getImageUrl } from "../utils/imageUtils";

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    province: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : [];
      if (parsed.length === 0) {
        navigate("/cart");
        return;
      }
      setItems(parsed);
    } catch (e) {
      navigate("/cart");
    }

    if (user && user.phone) {
      setFormData((prev) => ({ ...prev, phone: user.phone }));
    }
  }, [user, navigate]);

  const totalPrice = items.reduce((s, it) => s + (it.qty || 1) * (it.price || 0), 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { address, city, province, phone } = formData;

    if (!address || !city || !province || !phone) {
      alert(t("checkout_error"));
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderItems: items.map((it) => ({
          name: it.name,
          qty: it.qty || 1,
          image: it.image,
          price: it.price,
          product: it.id || it._id,
        })),
        shippingAddress: { address, city, province, phone },
        totalPrice: totalPrice,
      };

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const responseData = await res.json();
        const { esewaData } = responseData;

        if (!esewaData) {
          throw new Error("eSewa data missing from backend response");
        }

        // Clear cart local storage
        localStorage.removeItem("cart");
        window.dispatchEvent(new CustomEvent('cart-updated'));

        // Create a form dynamically and submit to eSewa
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");

        for (const key in esewaData) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", esewaData[key]);
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        const error = await res.json();
        alert(error.message || "Checkout failed");
      }
    } catch (err) {
      console.error("Checkout Error:", err);
      alert("An error occurred during checkout: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-dark mb-10 text-center">
        {t("checkout_title")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Form */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-gray/30">
          <h2 className="text-2xl font-bold text-brand-dark mb-8 flex items-center gap-3">
            <span className="w-8 h-8 bg-brand-magenta text-white rounded-full flex items-center justify-center text-sm">1</span>
            {t("checkout_shipping")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t("checkout_address")}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. New Baneshwor, Ward 10"
                className="w-full px-4 py-3 bg-brand-light border border-brand-gray/50 rounded-xl focus:ring-2 focus:ring-brand-magenta focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("checkout_city")}
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Kathmandu"
                  className="w-full px-4 py-3 bg-brand-light border border-brand-gray/50 rounded-xl focus:ring-2 focus:ring-brand-magenta focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t("checkout_province")}
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="e.g. Bagmati"
                  className="w-full px-4 py-3 bg-brand-light border border-brand-gray/50 rounded-xl focus:ring-2 focus:ring-brand-magenta focus:border-transparent transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {t("checkout_phone")}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 98XXXXXXXX"
                className="w-full px-4 py-3 bg-brand-light border border-brand-gray/50 rounded-xl focus:ring-2 focus:ring-brand-magenta focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 bg-brand-magenta text-white font-bold rounded-2xl shadow-xl shadow-brand-magenta/30 hover:bg-pink-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="h-6 bg-white p-1 rounded" />
                    {t("checkout_place_order")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Summary */}
        <div className="space-y-8">
          <div className="bg-brand-dark text-white p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 bg-brand-magenta text-white rounded-full flex items-center justify-center text-sm">2</span>
              {t("checkout_summary")}
            </h2>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 mb-8 custom-scrollbar">
              {items.map((it) => (
                <div key={it.id || it._id} className="flex gap-4 items-center">
                  <div className="relative">
                    <img
                      src={getImageUrl(it.image)}
                      alt={it.name}
                      className="w-20 h-20 object-cover rounded-2xl border border-white/10"
                    />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-magenta text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-brand-dark">
                      {it.qty || 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm line-clamp-2">{it.name}</h3>
                    <p className="text-white/60 text-xs">Rs. {(it.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="font-bold text-sm">
                    Rs. {((it.price || 0) * (it.qty || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex justify-between items-center text-white/60">
                <span>{t("cart_subtotal")}</span>
                <span>Rs. {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>{t("cart_shipping")}</span>
                <span className="text-green-400 font-bold uppercase text-xs">{t("cart_free")}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/20">
                <span className="text-xl font-bold">{t("cart_total")}</span>
                <span className="text-3xl font-bold text-brand-magenta">Rs. {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-magenta/5 border border-brand-magenta/20 p-6 rounded-2xl flex items-start gap-4">
            <div className="text-2xl text-brand-magenta">💳</div>
            <div>
              <h4 className="font-bold text-brand-dark text-sm mb-1">Secure Payment</h4>
              <p className="text-xs text-gray-500">
                Your transaction is secured with industry-standard encryption via eSewa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
