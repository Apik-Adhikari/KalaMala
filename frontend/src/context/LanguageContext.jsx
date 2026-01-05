import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    en: {
        nav_sell: "Want to sell?",
        nav_about: "About",
        hero_welcome: "Handmade with Love",
        hero_title_1: "Discover Unique",
        hero_title_2: "Artisan Treasures",
        hero_subtitle: "Explore a curated collection of handmade goods from independent makers around the country.",
        hero_subtitle_user: "Welcome back, {name}. Ready to find something special today?",
        hero_shop: "Shop Collection",
        hero_story: "Our Story",
        featured_title: "Featured Collection",
        featured_subtitle: "Handpicked treasures just for you.",
        view_all: "View all products →",
        footer_shop: "Shop",
        footer_support: "Support",
        footer_connected: "Stay Connected",
        search_placeholder: "Search for handmade treasures...",
        // Cart Page
        cart_title: "Your Shopping Cart",
        cart_empty: "Your cart is empty.",
        cart_browse: "Browse Products",
        cart_summary: "Order Summary",
        cart_subtotal: "Subtotal",
        cart_shipping: "Shipping",
        cart_free: "Free",
        cart_total: "Total",
        cart_checkout: "Proceed to Checkout",
        cart_clear: "Clear Cart",
        cart_item_remove: "Remove",
        cart_view: "View Cart",
        cart_qty: "Qty",
        // Product Details
        prod_back: "Back to Products",
        prod_stock_in: "In Stock",
        prod_stock_out: "Out of Stock",
        prod_qty: "Quantity",
        prod_add: "Add to Cart",
        prod_desc: "Description",
        prod_available: "{count} units available",
        // Auth
        auth_login_title: "Welcome Back",
        auth_register_title: "Create Account",
        auth_email: "Email",
        auth_password: "Password",
        auth_username: "Username",
        auth_phone: "Phone",
        auth_confirm_password: "Confirm Password",
        auth_forgot: "Forgot password?",
        auth_no_account: "Don't have an account?",
        auth_have_account: "Already have an account?",
        auth_login_btn: "Login",
        auth_register_btn: "Register",
        auth_google: "Sign in with Google",
        auth_close: "Close",
        auth_logging_in: "Logging in...",
        auth_registering: "Registering...",
        // User Menu
        user_profile: "Profile",
        user_orders: "My Orders",
        user_logout: "Logout",
        user_login: "Login",
        user_register: "Register",
        // About Page
        about_title: "About KalaMala",
        about_p1: "is a curated marketplace celebrating handmade craftsmanship and small-batch artistry. We bring together independent makers from across regions to showcase thoughtfully created products — from jewelry and textiles to ceramics and home goods.",
        about_p2: "We believe in stories behind every object. Each product on KalaMala is selected for its quality, sustainability, and the care with which it was created.",
        about_quote: "Whether you're shopping for a thoughtful gift or something unique for your home, KalaMala aims to connect you with makers and their stories.",
        about_footer: "Thank you for supporting small makers and choosing thoughtful goods."
    },
    ne: {
        nav_sell: "बिक्री गर्न चाहनुहुन्छ?",
        nav_about: "हाम्रो बारेमा",
        hero_welcome: "प्रेमपूर्वक हस्तनिर्मित",
        hero_title_1: "अद्वितीय कला",
        hero_title_2: "खजानाहरू फेला पार्नुहोस्",
        hero_subtitle: "देशभरका स्वतन्त्र निर्माताहरूबाट हस्तनिर्मित सामानहरूको सङ्ग्रह अन्वेषण गर्नुहोस्।",
        hero_subtitle_user: "स्वागत छ, {name}। आज केही विशेष फेला पार्न तयार हुनुहुन्छ?",
        hero_shop: "सङ्ग्रह किन्नुहोस्",
        hero_story: "हाम्रो कथा",
        featured_title: "विशेष सङ्ग्रह",
        featured_subtitle: "तपाईंको लागि छानिएका खजानाहरू।",
        view_all: "सबै उत्पादनहरू हेर्नुहोस् →",
        footer_shop: "किनमेल",
        footer_support: "सहयोग",
        footer_connected: "सम्पर्कमा रहनुहोस्",
        search_placeholder: "हस्तनिर्मित खजानाहरू खोज्नुहोस्...",
        // Cart Page
        cart_title: "तपाईंको किनमेल झोला",
        cart_empty: "तपाईंको झोला खाली छ।",
        cart_browse: "सामानहरू हेर्नुहोस्",
        cart_summary: "अर्डर सारांश",
        cart_subtotal: "उप-जम्मा",
        cart_shipping: "ढुवानी",
        cart_free: "नि:शुल्क",
        cart_total: "कुल जम्मा",
        cart_checkout: "चेकआउट गर्न अगाडि बढ्नुहोस्",
        cart_clear: "झोला खाली गर्नुहोस्",
        cart_item_remove: "हटाउनुहोस्",
        cart_view: "किनमेल झोला हेर्नुहोस्",
        cart_qty: "मात्रा",
        // Product Details
        prod_back: "सामानहरूमा फिर्ता जानुहोस्",
        prod_stock_in: "स्टकमा छ",
        prod_stock_out: "स्टक सकियो",
        prod_qty: "मात्रा",
        prod_add: "झोलामा थप्नुहोस्",
        prod_desc: "विवरण",
        prod_available: "{count} वटा उपलब्ध",
        // Auth
        auth_login_title: "स्वागत छ",
        auth_register_title: "खाता खोल्नुहोस्",
        auth_email: "इमेल",
        auth_password: "पासवर्ड",
        auth_username: "प्रयोगकर्ता नाम",
        auth_phone: "फोन नम्बर",
        auth_confirm_password: "पासवर्ड पुष्टि गर्नुहोस्",
        auth_forgot: "पासवर्ड बिर्सनुभयो?",
        auth_no_account: "खाता छैन?",
        auth_have_account: "पहिले नै खाता छ?",
        auth_login_btn: "लगइन",
        auth_register_btn: "दर्ता गर्नुहोस्",
        auth_google: "गुगल मार्फत साइन इन गर्नुहोस्",
        auth_close: "बन्द गर्नुहोस्",
        auth_logging_in: "लगइन हुँदैछ...",
        auth_registering: "दर्ता हुँदैछ...",
        // User Menu
        user_profile: "प्रोफाइल",
        user_orders: "मेरो अर्डरहरू",
        user_logout: "लग आउट",
        user_login: "लगइन",
        user_register: "दर्ता गर्नुहोस्",
        // About Page
        about_title: "KalaMala को बारेमा",
        about_p1: "हस्तनिर्मित वास्तुकला र सानो ब्याच कला मनाउने एक क्युरेट गरिएको बजार हो। हामी विभिन्न क्षेत्रका स्वतन्त्र निर्माताहरूलाई गहना र कपडादेखि सिरामिक्स र घरका सामानहरू सम्मका सोचविचार गरी सिर्जना गरिएका उत्पादनहरू प्रदर्शन गर्न सँगै ल्याउँछौं।",
        about_p2: "हामी प्रत्येक वस्तु पछाडिका कथाहरूमा विश्वास गर्छौं। KalaMala मा प्रत्येक उत्पादन यसको गुणस्तर, स्थिरता, र यसलाई सिर्जना गरिएको हेरचाहको लागि चयन गरिएको छ।",
        about_quote: "चाहे तपाईं विचारशील उपहार वा आफ्नो घरको लागि केहि अद्वितीय किनमेल गर्दै हुनुहुन्छ, KalaMala को लक्ष्य तपाईंलाई निर्माताहरू र तिनीहरूका कथाहरूसँग जोड्नु हो।",
        about_footer: "साना निर्माताहरूलाई समर्थन गरेकोमा र विचारशील सामानहरू रोज्नुभएकोमा धन्यवाद।"
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key, params = {}) => {
        let text = translations[language][key] || key;
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        return text;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ne' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
