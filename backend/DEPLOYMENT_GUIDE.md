# BoldTap Backend - Deployment & Verification Guide

## ✅ Backend Implementation Complete

Your BoldTap backend is now fully implemented and ready for deployment. This document provides step-by-step verification and deployment instructions.

## What's Included

### ✅ Features Implemented

#### 1. **Authentication System** (Production-Ready)

- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing (bcrypt)
- ✅ Profile management (get, update)
- ✅ Password change functionality
- ✅ Email availability checking
- ✅ Graceful error handling

#### 2. **Loyalty Card System**

- ✅ Create loyalty businesses
- ✅ Initialize loyalty cards for customers
- ✅ Track and add points
- ✅ User card management
- ✅ Business card analytics

#### 3. **NFC Business Profile System**

- ✅ Create professional NFC business cards
- ✅ Slug-based public profiles
- ✅ Complete profile information
- ✅ Update and delete operations
- ✅ Slug availability checking

#### 4. **Security & Infrastructure**

- ✅ CORS properly configured
- ✅ Helmet.js security headers
- ✅ JWT authentication middleware
- ✅ Input validation on all endpoints
- ✅ Comprehensive error handling
- ✅ Graceful server shutdown
- ✅ Development logging

#### 5. **Database**

- ✅ In-memory repository for development
- ✅ Database abstraction layer (easy to swap)
- ✅ Ready for PostgreSQL/MongoDB integration

#### 6. **Developer Experience**

- ✅ TypeScript for type safety
- ✅ Comprehensive README with examples
- ✅ .env configuration template
- ✅ Complete API documentation
- ✅ Error handling system

---

## Step-by-Step Verification

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

**Expected Output:**

- All dependencies installed successfully
- No vulnerabilities (or only low-risk advisory)

### Step 2: Verify Environment Configuration

Check `.env` file exists with proper settings:

```bash
cat .env
```

**Expected Output:**

```
PORT=3001
NODE_ENV=development
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=dev-secret-key-change-in-production-12345!
```

### Step 3: Start Development Server

```bash
npm run dev
```

**Expected Output:**

```
╔════════════════════════════════════════╗
║                                        ║
║      BoldTap Backend Server Start      ║
║                                        ║
╚════════════════════════════════════════╝

📍 Server:      http://localhost:3001
⚙️  Environment: development
📦 Port:        3001
⏱️  Started:     [current timestamp]

Ready to accept connections! 🚀
```

### Step 4: Verify Server is Running

In a new terminal, test the health endpoint:

```bash
curl http://localhost:3001/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-04-02T...",
  "uptime": 0.123
}
```

### Step 5: Check API Documentation

```bash
curl http://localhost:3001/api
```

**Expected Response:** Complete API endpoint list in JSON format

---

## API Testing Checklist

### Authentication Endpoints

#### ✅ Register User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "TestPassword123"
  }'
```

**Expected:** 201 Created with user data and token

#### ✅ Login User

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

**Expected:** 200 OK with user data and token

**Save the token for protected endpoints testing**

#### ✅ Get Current User

```bash
TOKEN="your-token-here"
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 200 OK with current user profile

#### ✅ Update Profile

```bash
TOKEN="your-token-here"
curl -X PUT http://localhost:3001/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Name",
    "phone": "9876543210"
  }'
```

**Expected:** 200 OK with updated profile

#### ✅ Check Email Availability

```bash
curl -X GET "http://localhost:3001/auth/check-email?email=newemail@example.com"
```

**Expected:** 200 OK with `{ "available": true }`

### Loyalty Card Endpoints

#### ✅ Create Loyalty Business

```bash
TOKEN="your-token-here"
curl -X POST http://localhost:3001/api/loyalty/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "slug": "my-cafe",
    "name": "My Cafe",
    "description": "Best cafe in town",
    "maxPoints": 100
  }'
```

**Expected:** 201 Created with business data

**Save the businessId for next tests**

#### ✅ Get Loyalty Business

```bash
curl -X GET http://localhost:3001/api/loyalty/business/my-cafe
```

**Expected:** 200 OK with business data

#### ✅ Create Loyalty Card

```bash
TOKEN="your-token-here"
curl -X POST http://localhost:3001/api/loyalty/card \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "businessId": "loyalty_biz_1",
    "userId": "user_1"
  }'
```

**Expected:** 201 Created with card data

**Save the cardId for next tests**

#### ✅ Get User's Cards

```bash
TOKEN="your-token-here"
curl -X GET http://localhost:3001/api/loyalty/user/cards \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 200 OK with array of user's cards

#### ✅ Add Points to Card

```bash
TOKEN="your-token-here"
curl -X POST http://localhost:3001/api/loyalty/card/card_1/points \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "points": 10
  }'
```

**Expected:** 200 OK with updated card (now has 10 points)

### NFC Business Profile Endpoints

#### ✅ Create NFC Profile

```bash
TOKEN="your-token-here"
curl -X POST http://localhost:3001/api/nfc/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "slug": "john-doe-nfc",
    "name": "John Doe",
    "title": "Cafe Owner",
    "phone": "1234567890",
    "email": "john@example.com",
    "website": "https://example.com",
    "bio": "Welcome to my cafe!"
  }'
```

**Expected:** 201 Created with profile data

#### ✅ Get NFC Profile by Slug

```bash
curl -X GET http://localhost:3001/api/nfc/profile/john-doe-nfc
```

**Expected:** 200 OK with NFC profile data

#### ✅ Check Slug Availability

```bash
curl -X GET "http://localhost:3001/api/nfc/check-slug?slug=unique-slug-123"
```

**Expected:** 200 OK with `{ "available": true, "slug": "unique-slug-123" }`

#### ✅ Update NFC Profile

```bash
TOKEN="your-token-here"
curl -X PUT http://localhost:3001/api/nfc/profile/nfc_1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Senior Cafe Owner",
    "bio": "Updated bio!"
  }'
```

**Expected:** 200 OK with updated profile

---

## Build for Production

### 1. Build TypeScript

```bash
npm run build
```

**Expected Output:**

- `dist/` directory created with compiled JavaScript
- No TypeScript errors

### 2. Verify Build Output

```bash
ls -la dist/
```

**Should contain:**

- `app.js`
- `server.js`
- All other compiled files

### 3. Test Production Build Locally

```bash
npm start
```

**Expected:** Server starts and responds to requests same as dev mode

---

## Environment Configuration for Deployment

### Development (.env)

```env
PORT=3001
NODE_ENV=development
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=dev-secret-key-change-in-production
```

### Staging (.env.staging)

```env
PORT=3001
NODE_ENV=staging
BACKEND_URL=https://api-staging.boldtap.com
FRONTEND_URL=https://staging.boldtap.com
JWT_SECRET=<generate-strong-secret>
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:pass@staging-db:5432/boldtap
```

### Production (.env.production)

```env
PORT=3001
NODE_ENV=production
BACKEND_URL=https://api.boldtap.com
FRONTEND_URL=https://boldtap.com
JWT_SECRET=<generate-very-strong-secret>
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:strong-pass@prod-db:5432/boldtap
```

---

## Deployment Platforms

### Option 1: Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create boldtap-backend

# Set environment variables
heroku config:set NODE_ENV=production JWT_SECRET=your-secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 2: Railway.app

1. Connect GitHub repository
2. Select `backend` directory
3. Add environment variables
4. Deploy automatically

### Option 3: AWS EC2

```bash
# SSH into instance
ssh -i key.pem ubuntu@instance-ip

# Clone and setup
git clone <repo>
cd BoldTap2/backend
npm install
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "boldtap-api" -- start

# Setup auto-restart
pm2 startup
pm2 save
```

### Option 4: Docker/Container

```bash
# Build image
docker build -t boldtap-backend .

# Run container
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret \
  -e DATABASE_URL=your-db-url \
  boldtap-backend
```

---

## Connecting Frontend

Update frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # For development
NEXT_PUBLIC_API_URL=https://api.boldtap.com  # For production
```

The frontend will now use the backend API instead of localStorage!

---

## Post-Deployment Checklist

- [ ] All endpoints responding correctly
- [ ] Database connection working (if using real DB)
- [ ] JWT tokens being generated
- [ ] CORS working with frontend
- [ ] Errors handling properly
- [ ] Health endpoint returns status
- [ ] Logs showing requests
- [ ] Password validation working
- [ ] Email validation working
- [ ] Authentication middleware blocking unauthorized access

---

## Common Issues & Solutions

### Issue: CORS Error

**Solution:** Check `FRONTEND_URL` in `.env` matches frontend origin

### Issue: Token Invalid

**Solution:** Ensure `JWT_SECRET` is consistent across all environments

### Issue: Database Error

**Solution:** Verify `DATABASE_URL` and database server is running

### Issue: Port Already in Use

**Solution:** Change `PORT` in `.env` or kill existing process

### Issue: Dependencies Not Found

**Solution:** Run `npm install` again and clear cache with `npm cache clean --force`

---

## Next Steps

1. **Add Real Database** (When Ready)
   - Install database adapter (Prisma, TypeORM, etc.)
   - Create connection in `src/lib/database.ts`
   - Run migrations

2. **Add Email Functionality** (Optional)
   - Setup SMTP credentials
   - Add password reset functionality
   - Add email verification

3. **Add Payment Processing** (Optional)
   - Integrate Stripe or PayPal
   - Create payment endpoints

4. **Setup Monitoring** (Recommended)
   - Add Sentry for error tracking
   - Setup DataDog or New Relic for monitoring
   - Configure alerts

---

## Support & Documentation

- **API Docs:** `http://localhost:3001/api`
- **Health Check:** `http://localhost:3001/health`
- **README:** See `backend/README.md`
- **Types:** See `backend/src/types/index.ts`

---

## Success! 🎉

Your BoldTap backend is fully implemented and ready for deployment!

**Next:** Connect frontend to this backend by updating the API URL configuration.

Questions? Check the README.md or code comments for detailed explanations.
