frontend/
├── public/
│   └── index.html        → HTML template that React injects into
│   └── favicon.ico       → Browser icon
│   └── manifest.json     → Progressive Web App metadata
│   └── robots.txt        → SEO rules (optional)
├── src/
│   ├── components/       → Reusable UI components (Header, Footer, ProductCard)
│   ├── pages/            → Full pages (HomePage, ProductPage, CartPage)
│   ├── redux/            → State management (store, actions, reducers)
│   ├── App.js            → Main React component
│   ├── index.js          → Entry point for React (renders App.js)
│   └── axios.js          → Axios setup for API calls
├── node_modules/         → All installed frontend packages (React, Axios, etc.)
├── package.json          → Frontend dependencies and scripts
└── .env                  → React environment variables

==================================================================

backend/
├── config/          → DB and environment configuration
│   └── db.js        → MongoDB connection setup
├── controllers/     → Functions that handle business logic for routes
├── models/          → Mongoose schemas for User, Product, Order
├── routes/          → Express routes for users, products, orders
├── middleware/      → Middleware like auth and error handling
├── utils/           → Helper functions (JWT token generation, etc.)
├── data/            → Sample data (for seeding/testing)
├── server.js        → Main backend server file
├── .env             → Environment variables
└── package.json     → Backend dependencies and scripts

====================================================================

Frontend ko lagi:

1. paila suruma components banaune 
2. tyo component lai arko component ma import garney
3. final combined components app.js file ma use garney

====================================================================


🏠 HomePage Component List

1️⃣ Layout / Structural Components
	•	Header.jsx – Top navigation bar with logo, search bar, and user/cart icons.
        Header/
            ├── Header.jsx           ← main container
            ├── Logo.jsx             ← company logo
            ├── NavMenu.jsx          ← navigation links
            ├── SearchBar.jsx        ← search input
            ├── UserMenu.jsx         ← account dropdown & notifications
            └── CartIcon.jsx         ← cart icon with item count

	•	Footer.jsx – Footer with links, contact info, social media icons.
	•	Banner.jsx – Hero section with main promotional banner.

2️⃣ Product / Content Components
	•	ProductCard.jsx – Displays individual product details (image, name, price, add-to-cart button).
	•	ProductList.jsx – Grid or carousel that renders multiple ProductCard components.
	•	CategoryCard.jsx – Optional: shows categories like “Men”, “Women”, “Electronics”.

3️⃣ UI / Utility Components
	•	Button.jsx – Reusable button component for “Shop Now”, “Add to Cart”, etc.
	•	Input.jsx – Optional: reusable input field for search bar or forms.
	•	Carousel.jsx – Optional: for sliding banners or featured products.
	•	Notification/Alert.jsx – Optional: display success or error messages.

4️⃣ Section Components (combine multiple components)
	•	FeaturedProducts.jsx – Section to show trending products using ProductList.
	•	BestSellers.jsx – Section showing top-selling products.
	•	Offers.jsx – Promotional offers or discount cards.