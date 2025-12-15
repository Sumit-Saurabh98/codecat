# 🚀 CodeCat Deployment Guide

This guide will help you deploy your CodeCat application with Inngest integration to production.

## 📋 Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- PostgreSQL database (we recommend Neon for easy setup)
- GitHub OAuth app configured
- Inngest account and API keys

## 🗄️ Database Setup

### Option 1: Neon (Recommended)
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Update your `.env` file:
```env
DATABASE_URL='postgresql://neondb_owner:your_password@your_host/neondb?sslmode=require'
```

### Option 2: Self-hosted PostgreSQL
```env
DATABASE_URL='postgresql://username:password@localhost:5432/codecat'
```

## 🔧 Environment Variables Setup

Create a `.env.production` file with the following variables:

```env
# Database
DATABASE_URL='your_production_database_url'

# Better Auth (OAuth)
BETTER_AUTH_SECRET='your_secure_random_secret_here'
BETTER_AUTH_URL='https://yourdomain.com'

# GitHub OAuth
GITHUB_CLIENT_ID='your_github_client_id'
GITHUB_CLIENT_SECRET='your_github_client_secret'

# Application URLs
NEXT_PUBLIC_APP_BASE_URL='https://yourdomain.com'

# AI Services
PINECONE_DB_API_KEY='your_pinecone_api_key'
GOOGLE_GENERATIVE_AI_API_KEY='your_gemini_api_key'

# Inngest (Production)
INNGEST_EVENT_KEY='your_inngest_event_key'
INNGEST_SIGNING_KEY='your_inngest_signing_key'
```

## ⚙️ Inngest Setup

### Understanding Inngest: Development vs Production

**Development Mode:**
- You run `npx inngest-cli@latest dev` locally
- This starts a local Inngest server that connects to your app
- Functions run locally when events are triggered
- Useful for testing and development

**Production Mode:**
- Inngest cloud handles function execution
- Your deployed app receives webhook calls from Inngest
- No need to run the CLI in production
- Functions execute in response to events via HTTP calls to your `/api/inngest` endpoint

### 1. Create Inngest Account
1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Create a new account or sign in
3. Create a new app called "codecat"

### 2. Configure Inngest Environment
1. In your Inngest dashboard, go to "Apps" → "codecat"
2. Copy the **Event Key** and **Signing Key**
3. Add them to your environment variables:
```env
INNGEST_EVENT_KEY='your_inngest_event_key'
INNGEST_SIGNING_KEY='your_inngest_signing_key'
```

### 3. Update Inngest Client
Your `inngest/client.ts` should automatically use the environment variables:

```typescript
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "codeCat",
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
```

**Note:** The `eventKey` and `signingKey` are optional in development but required for production webhook security.

## 🏗️ Build Configuration

### Next.js Configuration
Update `next.config.ts` for production:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features if needed
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },

  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
  },

  // Image optimization
  images: {
    domains: ['avatars.githubusercontent.com', 'githubusercontent.com'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
```

### Package.json Scripts
Ensure your `package.json` has the necessary scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

## 🚀 Deployment Platforms

### Option 1: Vercel (Recommended)

#### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

#### 2. Environment Variables
In Vercel dashboard, add all environment variables from your `.env.production` file:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://your-app.vercel.app
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
NEXT_PUBLIC_APP_BASE_URL=https://your-app.vercel.app
PINECONE_DB_API_KEY=...
GOOGLE_GENERATIVE_AI_API_KEY=...
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
```

#### 3. Build Settings
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### 4. Database Migration
Add a build hook or run manually:
```bash
npx prisma migrate deploy
npx prisma generate
```

### Option 2: Railway

#### 1. Connect Repository
1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

#### 2. Database Setup
1. Add PostgreSQL database to your project
2. Copy the DATABASE_URL from Railway
3. Update your environment variables

#### 3. Environment Variables
Add all required environment variables in Railway dashboard.

### Option 3: DigitalOcean App Platform

#### 1. Create App
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App" → "GitHub"
3. Select your repository

#### 2. App Settings
```
Resource Type: Web Service
Source: GitHub
Runtime: Node.js
Build Command: npm run build
Run Command: npm start
```

#### 3. Environment Variables
Add all environment variables in the app settings.

## 🔄 Inngest Webhook Configuration

### For Vercel Deployment:
1. In your Inngest dashboard, go to app settings
2. Set the webhook URL to: `https://your-app.vercel.app/api/inngest`
3. Inngest will automatically detect and configure the webhook

### For Other Platforms:
Set the webhook URL to: `https://yourdomain.com/api/inngest`

## 🗃️ Database Migration

Before deploying, ensure your database is properly set up:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed database with initial data
npx prisma db seed
```

## 🔐 Security Checklist

- [ ] All sensitive data is in environment variables
- [ ] Database URL uses SSL connection
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] API routes are protected
- [ ] OAuth redirect URLs are correct
- [ ] Inngest webhooks are secured

## 📊 Monitoring & Logging

### Inngest Monitoring
- Monitor function executions in Inngest dashboard
- Set up alerts for failed functions
- Track function performance metrics

### Application Monitoring
Consider adding:
- Sentry for error tracking
- Vercel Analytics for performance monitoring
- LogRocket for user session recordings

## 🚀 Post-Deployment Checklist

1. **Test Authentication**
   - GitHub OAuth login/logout
   - Session persistence

2. **Test Core Features**
   - Repository connection
   - Code review generation
   - Dashboard functionality

3. **Test Inngest Functions**
   - **Important:** Do NOT run `npx inngest-cli@latest dev` in production
   - Functions will run automatically when events are triggered
   - Test by triggering actual events (e.g., connecting a repository, creating a PR)
   - Monitor function executions in Inngest dashboard
   - Check that webhooks are properly configured at `/api/inngest`

4. **Performance Testing**
   - Page load times
   - API response times
   - Database query performance

5. **Security Testing**
   - Authentication flows
   - API endpoints
   - Data privacy

## 🐛 Troubleshooting

### Common Issues:

**Inngest functions not running:**
- Check webhook URL configuration
- Verify environment variables
- Check Inngest dashboard for errors

**Database connection issues:**
- Verify DATABASE_URL format
- Check SSL requirements
- Ensure database is accessible from deployment environment

**OAuth issues:**
- Verify redirect URLs in GitHub app settings
- Check BETTER_AUTH_URL configuration
- Ensure callback URLs match deployment domain

**Build failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript compilation errors

## 📞 Support

If you encounter issues:
1. Check deployment platform logs
2. Review Inngest function logs
3. Verify environment variable configuration
4. Test locally with production environment variables

## 🔄 Updates & Maintenance

- Regularly update dependencies
- Monitor database performance
- Keep Inngest functions optimized
- Review and rotate API keys periodically

---

*Happy deploying! 🚀*
