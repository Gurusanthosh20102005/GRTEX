# GR Tex Note: E-commerce Platform

A full-stack e-commerce solution built with Node.js/Express, Next.js, and PostgreSQL.

## Features
- **Storefront**: Browse products, filter by category/price, search using Faceted Search.
- **Cart & Checkout**: Persistent cart, multi-step checkout flow (Shipping -> Payment -> Review).
- **Admin Dashboard**: Manage products (Add/Delete), View Orders and Update Status.
- **Authentication**: JWT-based secure login for Customers and Admins.
- **Design**: Responsive UI with Tailwind CSS, custom "Deep Indigo" & "Muted Gold" branding.

## Prerequisites
- Node.js (v16+)
- Docker & Docker Compose

## Setup Instructions

### 1. Database Setup
Start the PostgreSQL database using Docker:
```bash
docker-compose up -d
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
npm install
```

Run the database seed script (populates 10 placeholder products):
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# Server running on http://localhost:5000
```

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
# App running on http://localhost:3000
```

## Usage Flow
1. **Visit Store**: Go to `http://localhost:3000`.
2. **Shop**: Browse products, add to cart.
3. **Login**: Use default credentials or register.
   - **Admin User**: (Mock Auth defaults to Admin if token missing/invalid in dev, or register a user and manually update role in DB to 'admin').
   - *Note*: Current Mock Payment implementation accepts any card number.
4. **Admin Panel**: Navigate to `/admin/dashboard` (Requires 'admin' role).

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express.js, PostgreSQL (pg), JWT.
- **DevOps**: Docker Compose for DB.
