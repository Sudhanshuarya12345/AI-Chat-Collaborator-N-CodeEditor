# Deployment Guide

This guide will help you deploy the full-stack application to various platforms.

## 1. Frontend Deployment (Vercel/Netlify)

### Prerequisites
- A GitHub account
- A Vercel or Netlify account

### Steps for Vercel Deployment

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Vite
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install`

6. Add Environment Variables:
   - VITE_API_URL: Your backend API URL
   - VITE_SOCKET_URL: Your backend WebSocket URL

7. Deploy!

### Steps for Netlify Deployment

1. Push your code to GitHub (same as Vercel steps 1)
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Choose GitHub and select your repository
5. Configure the build:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add Environment Variables (same as Vercel)
7. Deploy!

## 2. Backend Deployment (Render/Railway)

### Prerequisites
- A Render or Railway account
- MongoDB Atlas account
- Redis account (optional)

### Steps for Render Deployment

1. Go to [Render](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - Name: your-app-name
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
   - Plan: Free or paid

5. Add Environment Variables:
   - PORT: 3000
   - MONGODB_URI: Your MongoDB Atlas URI
   - JWT_SECRET: Your secret key
   - GOOGLE_AI_KEY: Your Google AI API key
   - REDIS_URL: Your Redis URL (if using)
   - NODE_ENV: production

6. Deploy!

### Steps for Railway Deployment

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`

6. Add Environment Variables (same as Render)
7. Deploy!

## 3. Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Set up database access (create a user)
5. Set up network access (allow access from anywhere)
6. Get your connection string
7. Add it to your backend environment variables

## 4. Final Configuration

1. Update frontend environment variables with your deployed backend URLs
2. Update backend environment variables with your MongoDB URI and other secrets
3. Redeploy both frontend and backend if needed

## 5. Testing the Deployment

1. Test the frontend application
2. Test the backend API endpoints
3. Test WebSocket connections
4. Test AI functionality
5. Test user authentication

## Common Issues and Solutions

1. CORS Issues:
   - Ensure backend CORS configuration includes your frontend URL
   - Check environment variables are correctly set

2. WebSocket Connection Issues:
   - Verify WebSocket URL in frontend configuration
   - Check backend WebSocket server configuration

3. Database Connection Issues:
   - Verify MongoDB URI
   - Check network access settings in MongoDB Atlas

4. Environment Variables:
   - Double-check all environment variables are set correctly
   - Ensure sensitive data is properly secured

## Security Considerations

1. Use HTTPS for all connections
2. Keep environment variables secure
3. Implement rate limiting
4. Use secure session management
5. Regular security updates
6. Monitor application logs 