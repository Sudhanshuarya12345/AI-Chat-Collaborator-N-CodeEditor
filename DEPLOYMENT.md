# Deployment Guide

This guide covers deploying the AI Chat Collaborator project to production.

## Prerequisites

- MongoDB Atlas account (free tier available)
- Redis Cloud account (free tier available)
- Backend hosting (Railway, Render, or Heroku)
- Frontend hosting (Vercel or Netlify)
- API keys for AI providers (Groq, OpenRouter, etc.)

---

## Option 1: Railway (Recommended - Easiest)

Railway automatically deploys full-stack apps and handles database connections.

### Backend Deployment on Railway

1. **Sign up** at [railway.app](https://railway.app)

2. **Connect GitHub repository**:
   ```bash
   git push origin main
   ```

3. **Create a new Railway project**:
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository

4. **Add services**:
   - Backend (Node.js) - points to `/backend`
   - Frontend (Node.js/Build) - points to `/frontend`

5. **Set Environment Variables**:
   - Go to Backend service → Variables
   - Add all variables from `.env`

6. **Configure start commands**:
   - Backend: `npm start`
   - Frontend: `npm run build && npx serve -s dist -l 3000`

### Frontend Deployment on Railway

1. Add Frontend service pointing to `/frontend`
2. Set `VITE_API_URL` to your Railway backend URL
3. Deploy

---

## Option 2: Render (Free + Paid Plans)

### Backend on Render

1. **Sign up** at [render.com](https://render.com)

2. **Create Web Service**:
   - Select "Deploy an existing Git repository"
   - Choose your repo

3. **Configure**:
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`

4. **Environment Variables**:
   - Add all variables from `.env`

5. **Deploy** → Get your backend URL (e.g., `https://your-api.onrender.com`)

### Frontend on Vercel (Recommended)

1. **Sign up** at [vercel.com](https://vercel.com)

2. **Import project**:
   - Connect GitHub account
   - Select your repository
   - Select `frontend` folder as root

3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-api.onrender.com
   VITE_SOCKET_URL=https://your-api.onrender.com
   ```

4. **Deploy**

---

## Option 3: Heroku (With Buildpack)

### Backend on Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create app**:
   ```bash
   heroku create your-app-name
   ```

3. **Set buildpack**:
   ```bash
   heroku buildpacks:set https://github.com/timdp/heroku-buildpack-monorepo.git
   ```

4. **Add Procfile** in root:
   ```
   web: npm start --prefix backend
   ```

5. **Set environment variables**:
   ```bash
   heroku config:set PORT=8080
   heroku config:set MONGODB_URI=your_mongodb_uri
   # ... set all other variables
   ```

6. **Deploy**:
   ```bash
   git push heroku main
   ```

---

## Database & Cache Setup

### MongoDB Atlas (Already Configured)

Your MongoDB connection is already set up. No changes needed.

### Redis Cloud (Already Configured)

Your Redis connection is already set up. No changes needed.

---

## Post-Deployment Checklist

- [ ] Backend API is accessible from frontend URL
- [ ] WebSocket connections work (Socket.io)
- [ ] MongoDB queries work
- [ ] Redis cache is functioning
- [ ] AI provider APIs are responding
- [ ] User authentication works
- [ ] File upload/sync works
- [ ] Real-time chat messages sync

---

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (8080 for backend) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT tokens |
| `REDIS_HOST` | Yes | Redis hostname |
| `REDIS_PORT` | Yes | Redis port |
| `REDIS_PASSWORD` | Yes | Redis password |
| `AI_FALLBACK_ORDER` | Yes | Comma-separated AI provider list |
| `GROQ_API_KEY` | Recommended | Groq API key |
| `OPENROUTER_API_KEY` | Optional | OpenRouter API key |

---

## Troubleshooting

### Backend won't connect to frontend
- Check `CORS_ORIGIN` matches frontend URL
- Ensure WebSocket is enabled in hosting

### Socket.io not connecting
- Check backend logs: `heroku logs --tail`
- Verify backend URL in frontend env variables
- Check firewall/security groups allow WebSocket

### AI responses fail
- Verify API keys are set correctly
- Check AI provider quotas
- Test with `curl` to debug

### Database connection fails
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Test connection locally first

---

## Cost Estimates (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| MongoDB Atlas | ✅ 512MB | ~$57 (2GB) |
| Redis Cloud | ✅ 30MB | ~$5 (250MB) |
| Vercel Frontend | ✅ | $20 (pro) |
| Railway/Render | ✅ $5 credit | $10-50 |
| **Total** | **Free** | **~$30-75** |

---

## Deployment Command Summary

```bash
# Build everything
npm run build

# Local testing before deploy
npm run dev

# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Ready for production"
git push origin main
```

---

## Need Help?

- Railway docs: https://docs.railway.app
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- Socket.io deployment: https://socket.io/docs/v4/socket-io-on-heroku/
