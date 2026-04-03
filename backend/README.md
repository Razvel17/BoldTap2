# BoldTap Backend API

Complete backend for the BoldTap loyalty card, NFC business card, auth, chat, websocket, and mobile money payment system.

## Features

✅ **Complete User Authentication**

- Registration with password validation
- Login with JWT tokens
- Profile management
- Password change functionality
- Email availability checking

✅ **Loyalty Card System**

- Create loyalty businesses
- Initialize loyalty cards for users
- Track points
- Business and user card management

✅ **NFC Business Profiles**

- Create professional NFC business cards
- Manage profile information
- Slug-based public profiles
- Update and delete profiles

✅ **Security & Production Ready**

- CORS configuration for frontend integration
- Helmet.js security headers
- JWT authentication
- Input validation and error handling
- Graceful shutdown handling

✅ **Mobile Money Payments**

- Provider-agnostic payment flow
- M-Pesa, Yas / Mixx, and Airtel Money integration points
- Provider callback handling
- Payment status tracking and purchase history

✅ **Database Agnostic**

- In-memory database for development (no setup needed)
- Easy database integration (PostgreSQL, MongoDB, etc.)
- Repository pattern for clean architecture

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and update settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3001
NODE_ENV=development
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/boldtap

MPESA_API_URL=
MPESA_STATUS_URL=
MPESA_API_KEY=
MPESA_BUSINESS_ID=

YAS_API_URL=
YAS_STATUS_URL=
YAS_API_KEY=
YAS_BUSINESS_ID=

AIRTEL_MONEY_API_URL=
AIRTEL_MONEY_STATUS_URL=
AIRTEL_MONEY_API_KEY=
AIRTEL_MONEY_BUSINESS_ID=
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

Output:

```
╔════════════════════════════════════════╗
║                                        ║
║      BoldTap Backend Server Start      ║
║                                        ║
╚════════════════════════════════════════╝

📍 Server:      http://localhost:3001
⚙️  Environment: development
📦 Port:        3001
⏱️  Started:     [timestamp]

Ready to accept connections! 🚀
```

### 4. Test API

Health check:

```bash
curl http://localhost:3001/health
```

API documentation:

```bash
curl http://localhost:3001/api
```

## Available Endpoints

### Authentication (`/auth`)

#### Public Endpoints

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| POST   | `/auth/register`    | Register new user           |
| POST   | `/auth/login`       | Login user                  |
| POST   | `/auth/logout`      | Logout user                 |
| GET    | `/auth/check-email` | Check if email is available |

#### Protected Endpoints (Require JWT)

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/auth/me`              | Get current user info |
| PUT    | `/auth/profile`         | Update user profile   |
| POST   | `/auth/change-password` | Change password       |

### Loyalty Cards (`/api/loyalty`)

#### Public Endpoints

| Method | Endpoint                      | Description          |
| ------ | ----------------------------- | -------------------- |
| GET    | `/api/loyalty/business/:slug` | Get loyalty business |
| GET    | `/api/loyalty/card/:cardId`   | Get loyalty card     |

#### Protected Endpoints (Require JWT)

| Method | Endpoint                                  | Description                |
| ------ | ----------------------------------------- | -------------------------- |
| POST   | `/api/loyalty/business`                   | Create loyalty business    |
| GET    | `/api/loyalty/user/businesses`            | Get user's businesses      |
| GET    | `/api/loyalty/user/cards`                 | Get user's cards           |
| POST   | `/api/loyalty/card`                       | Create/init loyalty card   |
| POST   | `/api/loyalty/card/:cardId/points`        | Add points to card         |
| PUT    | `/api/loyalty/business/:businessId`       | Update business            |
| DELETE | `/api/loyalty/card/:cardId`               | Delete card                |
| GET    | `/api/loyalty/business/:businessId/cards` | Get business cards (admin) |

### NFC Business Profiles (`/api/nfc`)

#### Public Endpoints

| Method | Endpoint                 | Description             |
| ------ | ------------------------ | ----------------------- |
| GET    | `/api/nfc/profile/:slug` | Get NFC profile         |
| GET    | `/api/nfc/check-slug`    | Check slug availability |

#### Protected Endpoints (Require JWT)

| Method | Endpoint                      | Description        |
| ------ | ----------------------------- | ------------------ |
| POST   | `/api/nfc/profile`            | Create NFC profile |
| GET    | `/api/nfc/profile`            | Get user's profile |
| PUT    | `/api/nfc/profile/:profileId` | Update profile     |
| DELETE | `/api/nfc/profile/:profileId` | Delete profile     |

### Payments (`/api/payments`)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/payments/providers` | List supported mobile money providers |
| POST | `/api/payments/collect` | Initiate a mobile money collection |
| GET | `/api/payments/:paymentId/status` | Get a payment status |
| GET | `/api/payments/customer/history` | Get payment history |
| POST | `/api/payments/webhook/:provider` | Provider callback endpoint |

## Request/Response Format

### Success Response (2xx)

```json
{
  "success": true,
  "data": {
    /* resource data */
  },
  "message": "Operation successful"
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "error": "Error message",
  "message": "Error message"
}
```

### Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Example API Calls

### Register User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "password": "SecurePassword123"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Resource created"
}
```

### Login User

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

### Initiate Mobile Money Collection

```bash
curl -X POST http://localhost:3001/api/payments/collect \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "mpesa",
    "phoneNumber": "0712345678",
    "amount": 1000,
    "currency": "TZS",
    "reference": "ORDER-1001",
    "customerName": "John Doe",
    "description": "BoldTap NFC card",
    "productType": "nfc_card"
  }'
```

### Create Loyalty Business

```bash
curl -X POST http://localhost:3001/api/loyalty/business \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "slug": "my-cafe",
    "name": "My Cafe",
    "description": "Local coffee shop",
    "maxPoints": 100
  }'
```

### Create NFC Profile

```bash
curl -X POST http://localhost:3001/api/nfc/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "slug": "john-doe",
    "name": "John Doe",
    "title": "Coffee Shop Owner",
    "phone": "1234567890",
    "email": "john@example.com",
    "website": "https://example.com",
    "bio": "Welcome to my cafe!"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── app.ts                          # Express app setup
│   ├── server.ts                       # Server entry point
│   ├── config/
│   │   ├── db.ts                       # Database configuration
│   │   └── env.ts                      # Environment variables
│   ├── controllers/
│   │   ├── authController.ts           # Auth request handlers
│   │   ├── loyaltyCardController.ts    # Loyalty card handlers
│   │   └── nfcBusinessController.ts    # NFC profile handlers
│   ├── services/
│   │   ├── authServices.ts             # Auth business logic
│   │   ├── loyaltyCardService.ts       # Loyalty card logic
│   │   └── nfcBusinessService.ts       # NFC profile logic
│   ├── middleware/
│   │   └── authMiddleware.ts           # JWT authentication
│   ├── routes/
│   │   ├── authRoutes.ts               # Auth routes
│   │   ├── loyaltyCardRoutes.ts        # Loyalty routes
│   │   └── nfcBusinessRoutes.ts        # NFC routes
│   ├── lib/
│   │   └── database.ts                 # Database abstraction
│   ├── types/
│   │   └── index.ts                    # TypeScript types
│   ├── utils/
│   │   ├── errors.ts                   # Error classes
│   │   └── validatePassword.ts         # Password validation
│   └── models/
│       └── user.ts                     # User model types
├── .env.example                         # Environment template
├── tsconfig.json                        # TypeScript config
└── package.json                         # Dependencies
```

## Database Setup

### Current: In-Memory Storage

The backend currently uses in-memory storage. data is lost on restart but perfect for development and testing.

### Future: PostgreSQL Setup

When ready to use a real database:

1. Install Prisma:

```bash
npm install @prisma/client @prisma/cli
npm install -D prisma
```

2. Configure database in `.env`:

```env
DATABASE_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/boldtap
```

3. Implement PostgreSQL repositories replacing in-memory implementation in `src/lib/database.ts`

## Build & Deployment

### Build for Production

```bash
npm run build
```

Outputs compiled JavaScript to `dist/` directory.

### Start Production Server

```bash
npm start
```

### Production Environment (.env)

```env
PORT=3001
NODE_ENV=production
BACKEND_URL=https://api.boldtap.com
FRONTEND_URL=https://boldtap.com
JWT_SECRET=<generate-a-strong-secret>
DATABASE_TYPE=postgres
DATABASE_URL=<your-production-database-url>
```

## Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t boldtap-backend .
docker run -p 3001:3001 --env-file .env boldtap-backend
```

## Error Handling

The backend uses a robust error handling system:

- **ValidationError** (400): Invalid input data
- **AuthenticationError** (401): Missing or invalid JWT token
- **AuthorizationError** (403): Insufficient permissions
- **NotFoundError** (404): Resource not found
- **ConflictError** (409): Resource already exists
- **AppError** (500): Generic server error

## Password Requirements

- Minimum 8 characters
- At least one letter (a-z, A-Z)
- At least one uppercase letter (A-Z)
- At least one digit (0-9)

## Security Notes

⚠️ **Development Only**: The `.env.example` contains a default JWT secret. **Change this in production!**

⚠️ **Password Hashing**: Passwords are hashed with bcrypt (10 rounds)

⚠️ **CORS**: Configure `FRONTEND_URL` to your actual frontend domain

⚠️ **HTTPS**: Use HTTPS in production

## Troubleshooting

### Port Already in Use

```bash
# Change port in .env
PORT=3002
```

### CORS Errors

Ensure `FRONTEND_URL` in `.env` matches your frontend's origin:

```env
FRONTEND_URL=http://localhost:3000
```

### JWT Token Errors

- Token expired: Request new token by logging in again
- Invalid token: Ensure header format is `Bearer <token>`
- Missing token: Add Authorization header to protected endpoints

### Database Errors (When Using Real DB)

Check database connection string in `.env` and ensure database server is running.

## Contributing

1. Follow TypeScript conventions
2. Add error handling to all async operations
3. Include proper validation for all inputs
4. Add JSDoc comments to functions
5. Test endpoints with provided examples

## License

MIT

## Support

For issues or questions, check the main project README or contact the development team.
