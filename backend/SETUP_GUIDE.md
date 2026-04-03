# BoldTap Backend - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
Already done! All packages are installed via `npm install`.

### 2. Set Up PostgreSQL Database

Choose ONE option:

#### Option A: Railway.app (Recommended)
1. Go to https://railway.app
2. Create account (free)
3. Create new PostgreSQL project
4. Copy connection string from dashboard
5. Paste into `.env` as `DATABASE_URL`

#### Option B: Local PostgreSQL
```bash
createdb boldtap
```

#### Option C: Supabase (Free tier includes PostgreSQL)
1. Go to https://supabase.com
2. Create project
3. Copy connection string from settings

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in these required fields:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/boldtap

# Email (SendGrid)
SENDGRID_API_KEY=SG.your_key_here
SMTP_FROM_EMAIL=noreply@boldtap.com

# OAuth - Google
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx

# OAuth - GitHub
GITHUB_CLIENT_ID=xxxx
GITHUB_CLIENT_SECRET=xxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# JWT
JWT_SECRET=your-secret-key-here
```

### 4. Get External API Keys

#### SendGrid (Email)
- https://app.sendgrid.com → API Keys → Create New

#### Google OAuth
- https://console.cloud.google.com
- Create project → OAuth 2.0 Credentials
- Add redirect: `http://localhost:3001/auth/google/callback`

#### GitHub OAuth
- https://github.com/settings/developers → OAuth Apps → New
- Add redirect: `http://localhost:3001/auth/github/callback`

#### Stripe
- https://dashboard.stripe.com/api/keys
- Use test keys (start with `sk_test_`)
- Create subscription plans for Starter ($10/mo) & Pro ($50/mo)

### 5. Run Database Migrations

```bash
npm run migrate
```

This creates all tables: users, oauth_accounts, verification_tokens, refresh_tokens, merchant_subscriptions, customer_purchases

### 6. Start Development Server

```bash
npm run dev
```

Server starts at: `http://localhost:3001`

---

## 📋 API Routes Summary

### Authentication Routes (`/auth`)

| Method | Path | Description | Auth Required |
|--------|------|-------------|---|
| POST | `/register` | Create account | ❌ |
| POST | `/login` | Login & get tokens | ❌ |
| POST | `/refresh` | Refresh access token | ❌ |
| POST | `/logout` | Logout (revoke token) | ✅ |
| POST | `/verify-email/:token` | Verify email | ❌ |
| POST | `/forgot-password` | Request password reset | ❌ |
| POST | `/reset-password/:token` | Reset password | ❌ |
| GET | `/google` | Google OAuth start | ❌ |
| GET | `/google/callback` | Google OAuth callback | ❌ |
| GET | `/github` | GitHub OAuth start | ❌ |
| GET | `/github/callback` | GitHub OAuth callback | ❌ |
| GET | `/me` | Get current user | ✅ |
| GET | `/me/info` | Get current user info | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| POST | `/change-password` | Change password | ✅ |
| GET | `/check-email` | Check if email exists | ❌ |

### Payment Routes (`/api/payments`)

#### Merchant Subscriptions
| Method | Path | Description | Auth Required |
|--------|------|-------------|---|
| GET | `/merchant/subscription/plans` | List subscription plans | ✅ |
| POST | `/merchant/subscription/start` | Start subscription | ✅ |
| GET | `/merchant/subscription/status` | Check subscription | ✅ |
| POST | `/merchant/subscription/cancel` | Cancel subscription | ✅ |

#### Customer Purchases
| Method | Path | Description | Auth Required |
|--------|------|-------------|---|
| POST | `/customer/intent` | Create payment intent | ✅ |
| GET | `/customer/history` | View purchase history | ✅ |

#### Webhooks
| Method | Path | Description | Auth Required |
|--------|------|-------------|---|
| POST | `/webhook/stripe` | Stripe webhook | ❌ |

---

## 🧪 Test the API

### 1. Register & Login
```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Response includes `accessToken` and `refreshToken`.

### 2. Use Access Token
```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Refresh Token
```bash
curl -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 4. Check Subscription Plans
```bash
curl -X GET http://localhost:3001/api/payments/merchant/subscription/plans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔑 Authentication Flow

### JWT + Refresh Token System

1. **Registration/Login**: User gets `accessToken` (15min) + `refreshToken` (7 days)
2. **Making Requests**: Send `Authorization: Bearer accessToken` header
3. **Token Expires**: Use `refreshToken` to get new `accessToken`
4. **Logout**: Server revokes `refreshToken`, must login again

### OAuth Flow

1. User clicks "Sign in with Google/GitHub"
2. Redirecto to: `/auth/google` or `/auth/github`
3. OAuth provider redirects to callback URL
4. BoldTap server gets tokens and creates/links user
5. Redirects to frontend with `accessToken` & `refreshToken`

---

## 💳 Payment System

### Subscription Plans (Merchants)

| Plan | Price | Businesses | Features |
|------|-------|-----------|----------|
| Free | $0 | 1 | Basic NFC cards, 100 customers |
| Starter | $10/mo | 3 | Advanced analytics, 1000 customers |
| Pro | $50/mo | 10 | Full features, unlimited customers, API access |
| Enterprise | Custom | Unlimited | White-label, SLA, dedicated support |

### One-Time Purchases (Customers)

Customers can buy products (NFC cards, rings, etc.) with one-time payments via Stripe.

---

## 📊 Database Schema

### Users Table
- UUID id (Primary Key)
- email (unique)
- name
- password (hashed)
- emailVerified (boolean)
- userType (customer/merchant/both)
- stripeCustomerId (optional)
- createdAt, updatedAt, deletedAt

### OAuth Accounts Table
- Links social accounts to users
- Supports Google & GitHub

### Tokens
- **Refresh Tokens**: Hashed, with expiry, can be revoked
- **Verification Tokens**: For email verification & password reset

### Subscriptions & Purchases
- Merchant subscriptions: Recurring billing
- Customer purchases: One-time transactions

---

## 🛡️ Security Features

✅ **Password Security**
- Bcrypt hashing (12 salt rounds)
- Min 8 chars, uppercase, number/special char

✅ **Token Security**
- JWT with HS256 algorithm
- Short-lived access tokens (15 min)
- Hashed refresh tokens in database
- Single-use verification tokens

✅ **Rate Limiting**
- General: 100 requests/15 min
- Auth: 12 requests/15 min

✅ **HTTP Security**
- Helmet security headers
- CORS validation
- XSS protection
- HSTS enforcement
- Content Security Policy

---

## 🐛 Troubleshooting

### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
Solution: Check PostgreSQL is running. Update `DATABASE_URL` in `.env`.

### SendGrid API Key Invalid
```
Error: 401 Unauthorized
```
Solution: Verify `SENDGRID_API_KEY` in `.env` (should start with `SG.`).

### OAuth Callback URL Mismatch
```
Error: Invalid redirect_uri
```
Solution: Make sure callback URLs in `.env` match OAuth app settings exactly.

### Migration Fails
```
Error: relation "users" already exists
```
Solution: Drop database and re-create: `dropdb boldtap && createdb boldtap && npm run migrate`

---

## 📝 Environment Variables Reference

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@host:5432/boldtap

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRY=7d
SESSION_SECRET=your-session-secret

# Email
SENDGRID_API_KEY=SG.xxxxx
SMTP_FROM_EMAIL=noreply@boldtap.com
SMTP_FROM_NAME=BoldTap

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx

# URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_RESET_PASSWORD_URL=http://localhost:3000/auth/reset-password
FRONTEND_VERIFY_EMAIL_URL=http://localhost:3000/auth/verify-email
```

---

## 🚀 Next Steps

1. **Frontend Integration**
   - Use accessToken in all authenticated requests
   - Store tokens securely (httpOnly cookies preferred)
   - Handle token refresh on 401 response

2. **OAuth Setup**
   - Add OAuth buttons to login page
   - Handle OAuth callback on frontend

3. **Payment Integration**
   - Add Stripe Elements for checkout
   - Handle webhook events for payment confirmation

4. **Production Deployment**
   - Switch to HTTPS
   - Use environment-specific configs
   - Set up error monitoring (Sentry, etc.)
   - Configure backup strategy

---

## 📞 Support

For issues or questions:
- Check the error message carefully
- Review troubleshooting section above
- Check `.env` configuration
- Review API route documentation

Happy coding! 🎉
