# MARKET — Backend

A RESTful API for the MARKET e-commerce platform, built with Node.js, Express, MongoDB, and Stripe.

---

## 🛠 Tech Stack

- **Node.js + Express** — Server and REST API
- **MongoDB + Mongoose** — Database and ODM
- **JWT** — Authentication tokens
- **bcryptjs** — Password hashing
- **Stripe** — Payment processing and webhooks
- **dotenv** — Environment configuration
- **nodemon** — Development auto-restart

---

## 📁 Project Structure

```
shop-backend/
├── models/
│   ├── User.js        # User schema (name, email, password, role, address)
│   ├── Product.js     # Product schema (name, price, stock, reviews, images)
│   └── Order.js       # Order schema (items, shipping, payment, status)
├── routes/
│   ├── auth.js        # Register, login, profile
│   ├── products.js    # CRUD products, reviews, categories
│   ├── orders.js      # Create and manage orders
│   ├── payments.js    # Stripe payment intents and webhooks
│   └── seed.js        # Database seeder route
├── middleware/
│   └── auth.js        # JWT protect and admin middleware
├── server.js          # Express app entry point
├── seed.js            # Local database seeder script
└── .env               # Environment variables (not committed)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (free test keys)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root:

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopdb
JWT_SECRET=your_long_random_secret_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:3000
```

### Seed the Database

```bash
node seed.js
```

Creates 8 sample products and 2 test users:
- **Admin:** admin@shop.com / admin123
- **User:** test@shop.com / test1234

### Run Locally

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at **http://localhost:5000**

---

## 🌐 Deployment (Render)

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add all environment variables from `.env`
7. Click **Deploy**

### Seed on Render (no shell access needed)

After deploying, visit this URL in your browser:
```
https://your-app.onrender.com/api/seed?secret=market_seed_2024
```

---

## 📡 API Reference

### Auth

| Method | Endpoint           | Auth | Description        |
|--------|--------------------|------|--------------------|
| POST   | /api/auth/register | —    | Create account     |
| POST   | /api/auth/login    | —    | Login, get JWT     |
| GET    | /api/auth/me       | ✓    | Get current user   |
| PUT    | /api/auth/profile  | ✓    | Update profile     |

### Products

| Method | Endpoint                  | Auth  | Description          |
|--------|---------------------------|-------|----------------------|
| GET    | /api/products             | —     | List with filters    |
| GET    | /api/products/categories  | —     | Get all categories   |
| GET    | /api/products/:id         | —     | Get single product   |
| POST   | /api/products             | Admin | Create product       |
| PUT    | /api/products/:id         | Admin | Update product       |
| DELETE | /api/products/:id         | Admin | Soft delete product  |
| POST   | /api/products/:id/reviews | ✓     | Add review           |

**Query Parameters for GET /api/products:**

| Param    | Example         | Description              |
|----------|-----------------|--------------------------|
| search   | ?search=phone   | Full-text search         |
| category | ?category=Electronics | Filter by category |
| sort     | ?sort=price_asc | Sort order               |
| page     | ?page=2         | Pagination               |
| limit    | ?limit=12       | Results per page         |
| featured | ?featured=true  | Featured products only   |
| minPrice | ?minPrice=50    | Minimum price filter     |
| maxPrice | ?maxPrice=200   | Maximum price filter     |

### Orders

| Method | Endpoint              | Auth  | Description         |
|--------|-----------------------|-------|---------------------|
| POST   | /api/orders           | ✓     | Create order        |
| GET    | /api/orders/mine      | ✓     | My orders           |
| GET    | /api/orders/:id       | ✓     | Get single order    |
| GET    | /api/orders           | Admin | All orders          |
| PUT    | /api/orders/:id/status | Admin | Update status      |

### Payments

| Method | Endpoint                            | Auth | Description               |
|--------|-------------------------------------|------|---------------------------|
| POST   | /api/payments/create-payment-intent | ✓    | Create Stripe intent      |
| POST   | /api/payments/webhook               | —    | Stripe webhook handler    |
| POST   | /api/payments/confirm               | ✓    | Confirm payment fallback  |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT tokens expire in **30 days**
- Product prices always **re-fetched server-side** — clients cannot manipulate prices
- Stripe webhook **signature verified** on every event
- Admin routes protected by **role middleware**
- CORS restricted to frontend URL

---

## 💳 Stripe Setup

### Test Cards

| Card Number          | Result            |
|----------------------|-------------------|
| 4242 4242 4242 4242  | Payment succeeds  |
| 4000 0000 0000 9995  | Payment declined  |
| 4000 0025 0000 3155  | Requires 3D Secure|

### Webhooks (Local Development)

```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:5000/api/payments/webhook
```

Copy the webhook signing secret → paste as `STRIPE_WEBHOOK_SECRET` in `.env`

### Webhooks (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.onrender.com/api/payments/webhook`
3. Select event: `payment_intent.succeeded`
4. Copy signing secret → update `STRIPE_WEBHOOK_SECRET` on Render

---

## 📦 Order Status Flow

```
pending → paid → processing → shipped → delivered
                                      → cancelled
                                      → refunded
```

When `payment_intent.succeeded` webhook fires:
- Order status updates to `paid`
- Product stock decrements automatically