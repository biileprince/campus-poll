# Campus Poll - Render Deployment Guide

## Prerequisites

1. A Render account (https://render.com)
2. PostgreSQL database (can be created on Render)

## Deployment Steps

### 1. Create PostgreSQL Database on Render

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `campus-poll-db`
4. Select your plan (Free tier available)
5. Click "Create Database"
6. Copy the **Internal Database URL** (starts with `postgresql://`)

### 2. Deploy Backend (Web Service)

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `campus-poll`
   - **Region**: Choose closest to you
   - **Branch**: `mobile-responsive-ui` (or `main`)
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && cd ../client && npm install --include=dev && npm run build && cd ../server && npm run db:generate`
   - **Start Command**: `npm run db:push && npm start`

### 3. Environment Variables

Add these in Render Dashboard → Environment:

- `NODE_ENV` = `production`
- `DATABASE_URL` = (paste your PostgreSQL Internal Database URL)
- `PORT` = `10000`

### 4. Deploy

Click "Create Web Service" and wait for deployment to complete.

## How It Works

- Frontend is built into static files (`client/dist`)
- Express server serves these static files
- All API routes are prefixed with `/api`
- React Router is handled by the server for all non-API routes

## Local Testing

To test production build locally:

```bash
cd server
npm run build
npm start
```

Then visit http://localhost:5000

## Troubleshooting

- If database migrations fail, check DATABASE_URL format
- Ensure all dependencies are in package.json (not devDependencies for build tools)
- Check Render logs for specific error messages
