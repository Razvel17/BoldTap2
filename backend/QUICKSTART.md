# 🚀 Quick Start - BoldTap Backend

Get your backend running in 3 minutes!

## Prerequisites

- Node.js (v18+) installed
- npm or yarn
- Terminal/Command line

## Setup Steps

### 1️⃣ Install Dependencies

```bash
cd backend
npm install
```

### 2️⃣ Start Server

```bash
npm run dev
```

You should see:

```
📍 Server:      http://localhost:3001
Ready to accept connections! 🚀
```

### 3️⃣ Test It Works

```bash
curl http://localhost:3001/health
```

## That's It! ✅

Your backend is running!

---

## Next: Connect Frontend

Update your frontend's `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Then your frontend will use the backend instead of localStorage!

---

## Common Commands

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm start`     | Run production server    |

---

## API Documentation

Visit: `http://localhost:3001/api`

---

## Example API Call

```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

## Database

**Using in-memory storage (no setup needed)** ✅

Data persists while server is running. When you're ready to use PostgreSQL/MongoDB, just update the code - the abstraction is already built in!

---

## Issues?

1. **Port already in use?** → Change `PORT` in `.env`
2. **CORS errors?** → Check `FRONTEND_URL` in `.env`
3. **Dependencies missing?** → Run `npm install` again

---

## File Structure

```
backend/
├── src/
│   ├── app.ts           ← Main Express app
│   ├── server.ts        ← Server entry point
│   ├── controllers/     ← Request handlers
│   ├── services/        ← Business logic
│   ├── routes/          ← API endpoints
│   ├── middleware/      ← Authentication
│   └── lib/             ← Database & utilities
├── .env                 ← Configuration (already set up!)
├── package.json         ← Dependencies
└── README.md            ← Full documentation
```

---

## Need More?

- 📖 Full README: `backend/README.md`
- 🚀 Deployment: `backend/DEPLOYMENT_GUIDE.md`
- 🔌 API Docs: Visit `http://localhost:3001/api`

---

## ✨ Features Ready to Use

✅ User registration & login  
✅ Loyalty card system  
✅ NFC business profiles  
✅ JWT authentication  
✅ Error handling  
✅ CORS configured

**Everything is production-ready!** Deploy whenever you're ready. 🎉
