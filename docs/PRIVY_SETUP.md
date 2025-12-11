# 🔐 Privy Authentication Setup Guide

This guide provides comprehensive instructions for setting up Privy authentication in SPACE_BASES, both for local development and Vercel deployment.

## 📚 Official Documentation

This setup follows the official Privy React documentation:
- **React Setup Guide**: https://docs.privy.io/basics/react/setup
- **Privy Dashboard**: https://dashboard.privy.io
- **API Reference**: https://docs.privy.io/reference

## 📋 Prerequisites

1. A Privy account (sign up at https://dashboard.privy.io)
2. A Privy app (create one in the Privy dashboard)
3. Node.js 18.x or higher installed
4. A Vercel account for deployment (optional, for production)

## 🔑 Environment Variables Required

SPACE_BASES requires two Privy environment variables:

| Variable | Type | Description | Used Where |
|----------|------|-------------|------------|
| `NEXT_PUBLIC_PRIVY_API_KEY` | Public | Your Privy App ID (starts with 'clp') | Client-side (browser) |
| `PRIVY_APP_SECRET` | Secret | Your Privy App Secret | Server-side only (API routes) |

⚠️ **Security Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the browser - this is intentional for Privy App ID
- `PRIVY_APP_SECRET` is NEVER exposed to the browser and should be kept secure
- Never commit these values to Git

## 🎯 Getting Your Privy Credentials

### Step 1: Access Privy Dashboard

1. Go to https://dashboard.privy.io
2. Sign in or create an account
3. Create a new app or select an existing one

### Step 2: Get Your App ID

1. In your Privy app dashboard, navigate to **Settings**
2. Find the **App ID** section
3. Copy your App ID (format: `clp-xxxxxxxxxxxxx`)
4. This will be used as `NEXT_PUBLIC_PRIVY_API_KEY`

### Step 3: Get Your App Secret

1. In the same Settings page, find the **API Secret** section
2. Click "Show" to reveal your secret
3. Copy the secret value
4. This will be used as `PRIVY_APP_SECRET`

⚠️ **Important**: Keep your App Secret secure. If compromised, regenerate it immediately in the Privy dashboard.

## 💻 Local Development Setup

### Method 1: Using .env file (Recommended)

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file:**
   ```bash
   # Open .env in your editor
   nano .env  # or use your preferred editor
   ```

3. **Add your credentials:**
   ```env
   # Privy Authentication
   NEXT_PUBLIC_PRIVY_API_KEY=clp-your-app-id-here
   PRIVY_APP_SECRET=your-app-secret-here
   ```

4. **Verify .env is in .gitignore:**
   ```bash
   # .env should already be listed in .gitignore
   cat .gitignore | grep ".env"
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Verify configuration:**
   - Open http://localhost:3000
   - You should NOT see the yellow configuration warning banner
   - The "Connect with Privy" button should be functional

### Method 2: Using command-line environment variables

```bash
NEXT_PUBLIC_PRIVY_API_KEY=clp-xxxxx PRIVY_APP_SECRET=xxxxx npm run dev
```

## 🚀 Vercel Deployment Setup

### Step 1: Deploy to Vercel

You can deploy using any of these methods:

#### Option A: One-Click Deploy
1. Click the "Deploy with Vercel" button in the README
2. Vercel will fork the repo and start deployment

#### Option B: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

#### Option C: GitHub Integration
1. Push code to your GitHub repository
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel auto-detects Next.js configuration

### Step 2: Configure Environment Variables in Vercel

**CRITICAL**: You MUST set environment variables in Vercel Dashboard, not just locally.

1. **Access Project Settings:**
   - Go to your project on Vercel
   - Click on **Settings**
   - Navigate to **Environment Variables**

2. **Add NEXT_PUBLIC_PRIVY_API_KEY:**
   - Key: `NEXT_PUBLIC_PRIVY_API_KEY`
   - Value: `clp-your-app-id-here` (your Privy App ID)
   - Environments: Select **Production**, **Preview**, and **Development**
   - Click **Save**

3. **Add PRIVY_APP_SECRET:**
   - Key: `PRIVY_APP_SECRET`
   - Value: `your-app-secret-here` (your Privy App Secret)
   - Environments: Select **Production**, **Preview**, and **Development**
   - ⚠️ This is a secret - Vercel will encrypt it
   - Click **Save**

4. **Redeploy the project:**
   - Go to **Deployments**
   - Click the three dots menu on the latest deployment
   - Click **Redeploy**
   - Check "Use existing Build Cache" (optional)
   - Click **Redeploy**

### Step 3: Configure Privy Dashboard for Your Vercel Domain

1. **Get your Vercel URL:**
   - After deployment, note your URL: `https://your-project.vercel.app`
   - Also note preview URLs if using them

2. **Add Vercel URLs to Privy allowed origins:**
   - Go to Privy Dashboard → Your App → Settings
   - Find **Allowed Origins** section
   - Add your Vercel URLs:
     - `https://your-project.vercel.app`
     - `https://your-custom-domain.com` (if using custom domain)
     - `https://*.vercel.app` (to allow all preview deployments)
   - Save changes

3. **Configure redirect URIs (if needed):**
   - In Privy Settings, find **Redirect URIs**
   - Add: `https://your-project.vercel.app/api/auth/callback`
   - This is used for OAuth callbacks

### Step 4: Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Check for the configuration warning:
   - ✅ Should NOT see yellow warning banner
   - ✅ "Connect with Privy" button should be enabled
3. Test authentication:
   - Click "Connect with Privy"
   - Privy modal should appear
   - Try logging in with email or wallet
4. Check Vercel logs:
   ```bash
   vercel logs
   ```
   - Should not see "PRIVY_APP_SECRET not found" errors

## 🔧 Troubleshooting

### Issue: Configuration Warning Banner Appears

**Symptoms:**
- Yellow banner at top: "⚠️ Configuration Required"
- "Connect with Privy" button is disabled

**Causes & Solutions:**

1. **Missing NEXT_PUBLIC_PRIVY_API_KEY:**
   - Local: Check .env file exists and has the variable
   - Vercel: Check Environment Variables in Vercel dashboard
   - Verify the variable name is exact (case-sensitive)

2. **Invalid App ID format:**
   - Privy App IDs must start with 'clp'
   - Check for typos or extra spaces
   - Regenerate App ID in Privy dashboard if needed

3. **Environment not reloaded:**
   - Local: Restart `npm run dev`
   - Vercel: Redeploy the project after adding env vars

### Issue: "PRIVY_APP_SECRET not found"

**Symptoms:**
- Error in server logs
- Authentication API routes fail
- Console error: "Missing PRIVY_APP_SECRET environment variable"

**Solutions:**
1. Verify `PRIVY_APP_SECRET` is set (not just `NEXT_PUBLIC_PRIVY_API_KEY`)
2. Check spelling (case-sensitive, no typos)
3. Restart development server or redeploy on Vercel
4. Ensure variable is set for correct environment (Production/Preview/Development)

### Issue: Privy Widget Not Loading

**Symptoms:**
- Modal doesn't appear when clicking "Connect with Privy"
- Console errors about Privy SDK

**Solutions:**
1. Check browser console for detailed errors
2. Verify App ID is correct in Privy dashboard
3. Check Privy dashboard for allowed origins:
   - Local: `http://localhost:3000` should be allowed
   - Vercel: Your Vercel domain should be allowed
4. Clear browser cache and reload
5. Check Network tab for failed Privy API calls

### Issue: Authentication Works Locally But Not on Vercel

**Causes & Solutions:**

1. **Missing environment variables on Vercel:**
   - Go to Vercel Project Settings → Environment Variables
   - Ensure both variables are set for Production environment
   - Redeploy after adding

2. **Privy allowed origins not configured:**
   - Add your Vercel URL to Privy dashboard allowed origins
   - Include preview URLs if testing preview deployments

3. **Build-time vs Runtime variables:**
   - `NEXT_PUBLIC_*` variables are embedded at build time
   - Must redeploy after changing these variables
   - `PRIVY_APP_SECRET` is runtime only - no rebuild needed

### Issue: "Failed to fetch" or CORS Errors

**Solutions:**
1. Check Privy dashboard allowed origins
2. Ensure URL protocol matches (https vs http)
3. Check for trailing slashes in origin URLs
4. Verify your domain is not blocked by Privy

## 📱 Environment-Specific Configuration

### Development Environment
```env
# Local development (.env)
NEXT_PUBLIC_PRIVY_API_KEY=clp-development-app-id
PRIVY_APP_SECRET=development-secret

# Privy Dashboard Allowed Origins:
# - http://localhost:3000
```

### Preview/Staging Environment
```env
# Vercel Preview Environment Variables
NEXT_PUBLIC_PRIVY_API_KEY=clp-staging-app-id
PRIVY_APP_SECRET=staging-secret

# Privy Dashboard Allowed Origins:
# - https://*.vercel.app
# - https://staging.yourdomain.com
```

### Production Environment
```env
# Vercel Production Environment Variables
NEXT_PUBLIC_PRIVY_API_KEY=clp-production-app-id
PRIVY_APP_SECRET=production-secret

# Privy Dashboard Allowed Origins:
# - https://your-project.vercel.app
# - https://yourdomain.com
```

## 🔒 Security Best Practices

### Do's ✅

1. **Use separate Privy apps for different environments:**
   - Development app for local testing
   - Staging app for preview deployments
   - Production app for live site

2. **Keep secrets secure:**
   - Never commit .env files
   - Use Vercel's encrypted environment variables
   - Rotate secrets regularly

3. **Configure allowed origins restrictively:**
   - Only add domains you control
   - Use exact URLs when possible
   - Avoid wildcard origins in production

4. **Monitor access:**
   - Check Privy dashboard analytics
   - Review authentication logs
   - Set up alerts for suspicious activity

### Don'ts ❌

1. **Never commit secrets to Git:**
   - Don't add .env to version control
   - Don't hardcode credentials in code
   - Don't share secrets in public channels

2. **Don't expose PRIVY_APP_SECRET:**
   - Never use in client-side code
   - Don't log it to console
   - Don't send in API responses

3. **Don't reuse credentials across environments:**
   - Each environment should have unique keys
   - Compromised dev keys won't affect production

## 📚 Additional Resources

### Official Privy Documentation
- **Main Docs**: https://docs.privy.io
- **React Setup**: https://docs.privy.io/basics/react/setup
- **Configuration**: https://docs.privy.io/basics/configuration
- **API Reference**: https://docs.privy.io/reference
- **Security Best Practices**: https://docs.privy.io/security

### Vercel Documentation
- **Environment Variables**: https://vercel.com/docs/environment-variables
- **Next.js Deployment**: https://vercel.com/docs/frameworks/nextjs
- **Domains**: https://vercel.com/docs/custom-domains

### SPACE_BASES Documentation
- **README**: See repository README.md
- **Deployment Guide**: See DEPLOYMENT_GUIDE.md
- **GameFi Architecture**: See docs/GAMEFI_ARCHITECTURE.md

## 🆘 Getting Help

If you're still experiencing issues:

1. **Check the Privy Dashboard:**
   - Look for error messages or warnings
   - Verify your app status
   - Check recent activity logs

2. **Review Vercel Logs:**
   ```bash
   vercel logs --follow
   ```

3. **Contact Support:**
   - Privy Support: https://privy.io/support
   - Vercel Support: https://vercel.com/support
   - Project Issues: https://github.com/EcosystemNetwork/SPACE_BASES/issues

4. **Community Resources:**
   - Privy Discord: (check Privy website for invite)
   - Vercel Community: https://github.com/vercel/vercel/discussions

---

**Document Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained By**: SPACE_BASES Team
