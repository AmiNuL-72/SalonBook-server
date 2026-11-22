# SalonBook Server — REST API & Authentication Backend

Backend service for **SalonBook**, a salon appointment booking and management platform built with Node.js, Express.js, TypeScript, MongoDB (Mongoose), JWT authentication, and Stripe payments.

---

## 🌟 Important Features

- **JWT Authentication & RBAC (Role-Based Access Control)**:
  - Secure registration & login with Bcrypt password hashing
  - Server-side role verification (`admin` vs `customer`)
  - Prevention of unauthorized administrative registrations through public sign-up
  - Active suspension enforcement preventing blocked users from accessing protected endpoints
- **Salon Service Catalog API**:
  - Full CRUD for salon services (Admin only)
  - Full-text search by service name
  - Category-based filtering and price sorting (`price-asc`, `price-desc`)
  - Active vs. Inactive service visibility enforcement (public sees only active services)
- **Appointment Booking & Management**:
  - Customer appointment request submissions with date, time slot, and special requests
  - Server-side slot conflict protection to prevent double bookings
  - Rule-based cancellation (customers can only cancel their own pending appointments)
  - Administrative appointment confirmation workflow
- **Payment Processing (Stripe Integration)**:
  - Stripe Checkout session creation for confirmed salon appointments
  - Verified Stripe webhook endpoint to safely transition payment status to `paid`
  - Automated transaction ledger logging customer information, appointment metadata, amounts, and session references
- **Administrative Governance & Metrics**:
  - Customer account management (view all, block / unblock customers)
  - Real-time aggregation endpoints for dashboard statistics (revenues, active services, pending/confirmed requests)
- **Database Seeding**:
  - Automatic seed script for default salon administrator and initial luxury salon service catalogue

---

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v5)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Payment Gateway**: Stripe SDK
- **Security & Utilities**: CORS, Dotenv, ts-node-dev

---

## 📋 Required Environment Variables

Create a `.env` file in the root of the `server/` directory and supply the following variables (see `.env.example`):

| Variable Name | Description |
|---|---|
| `PORT` | Local server port (e.g. `5000`) |
| `MONGODB_URI` | MongoDB connection URI string (Atlas or Local) |
| `JWT_SECRET` | Cryptographic secret for signing JWT access tokens |
| `CLIENT_URL` | Frontend origin URL for CORS and Stripe redirects (e.g. `http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Secret API key from Stripe developer dashboard |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for verified Stripe webhook events |

*(Note: Never push actual secret values or `.env` files to GitHub).*

---

## 🚀 Installation & Local Setup

### 1. Clone the repository & navigate to server
```bash
git clone <server-repo-url>
cd server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Fill in your MONGODB_URI and JWT_SECRET
```

### 4. Run the development server
```bash
npm run dev
```
The server will start listening at `http://localhost:5000`.

### 5. Production Build & Run
```bash
npm run build
npm start
```

---

## 🔐 Default Credentials for Evaluation

When the server runs for the first time and connects to the database, it automatically provisions the default administrator:

- **Admin Email**: `admin@salonbook.com`
- **Admin Password**: `Admin123!`
- **Demo Customer Email**: `demo@example.com`
- **Demo Customer Password**: `Customer123!`

---

## 🔗 Important Links

- **Live Website Link**: [https://salonbook-as09.vercel.app/](https://salonbook-as09.vercel.app/)
- **Client Repository**: [https://github.com/AmiNuL-72/SalonBook-client](https://github.com/AmiNuL-72/SalonBook-client)
- **Server Repository**: [https://github.com/AmiNuL-72/SalonBook-server](https://github.com/AmiNuL-72/SalonBook-server)
