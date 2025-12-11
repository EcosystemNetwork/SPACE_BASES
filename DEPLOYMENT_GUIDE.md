# 🚀 SPACE_BASES Deployment Guide

## Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. Click the "Deploy with Vercel" button in the README
2. Vercel will fork the repo and start deployment
3. Add environment variables:
   - `NEXT_PUBLIC_PRIVY_API_KEY` - Your Privy public API key
   - `PRIVY_APP_SECRET` - Your Privy app secret
4. Click "Deploy"
5. Your site will be live at `https://your-project.vercel.app`

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd SPACE_BASES
vercel

# Follow prompts to link project and configure
```

### Option 3: GitHub Integration

1. Push this code to your GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel auto-detects Next.js configuration
6. Add environment variables in project settings
7. Deploy!

## Environment Setup

### Get Privy Credentials

Follow the official Privy documentation: https://docs.privy.io/basics/react/setup

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app or select existing
3. Navigate to **Settings**
4. Copy:
   - **App ID** (starts with 'clp') → Use as `NEXT_PUBLIC_PRIVY_API_KEY`
   - **App Secret** → Use as `PRIVY_APP_SECRET`

### Configure Environment Variables in Vercel

**IMPORTANT**: All environment variables MUST be configured in Vercel Dashboard for deployment to work.

#### Step-by-Step Instructions:

1. **Access Vercel Dashboard:**
   - Go to your project on Vercel
   - Click **Settings** in the top navigation
   - Select **Environment Variables** from the sidebar

2. **Add NEXT_PUBLIC_PRIVY_API_KEY:**
   - Click "Add New" button
   - Name: `NEXT_PUBLIC_PRIVY_API_KEY`
   - Value: Your Privy App ID (format: `clp-xxxxxxxxxxxxx`)
   - Environments: Check **Production**, **Preview**, and **Development**
   - Click **Save**

3. **Add PRIVY_APP_SECRET:**
   - Click "Add New" button again
   - Name: `PRIVY_APP_SECRET`
   - Value: Your Privy App Secret
   - Environments: Check **Production**, **Preview**, and **Development**
   - ⚠️ Mark as **Sensitive** (Vercel will encrypt it)
   - Click **Save**

4. **Redeploy Your Project:**
   - Go to **Deployments** tab
   - Find your latest deployment
   - Click the **⋯** (three dots) menu
   - Select **Redeploy**
   - Confirm the redeploy

⚠️ **Critical Notes:**
- Changes to `NEXT_PUBLIC_*` variables require a rebuild/redeploy
- Server-side variables (`PRIVY_APP_SECRET`) take effect immediately but redeploy is recommended
- Variables must be set for each environment you want to use (Production, Preview, Development)

📖 **For comprehensive setup instructions, troubleshooting, and security best practices, see:**
[**docs/PRIVY_SETUP.md**](../docs/PRIVY_SETUP.md)

## Post-Deployment

### Verify Deployment

1. Visit your Vercel URL
2. Check that landing page loads with animations
3. Click "Connect with Privy" button
4. Verify Privy widget attempts to load (may need valid API key)

### Custom Domain (Optional)

1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate auto-generated

### Update Privy Configuration for Your Domain

**REQUIRED**: Configure Privy to allow requests from your Vercel domain.

1. **Access Privy Dashboard:**
   - Go to [Privy Dashboard](https://dashboard.privy.io)
   - Select your app
   - Navigate to **Settings**

2. **Add Allowed Origins:**
   - Find the **Allowed Origins** section
   - Add your Vercel deployment URLs:
     - `https://your-project.vercel.app` (your main Vercel URL)
     - `https://*.vercel.app` (to allow all preview deployments)
     - `https://yourdomain.com` (if using custom domain)
   - Click **Save**

3. **Configure Redirect URIs (if needed):**
   - In the same Settings page, find **Redirect URIs**
   - Add: `https://your-project.vercel.app/api/auth/callback`
   - This is used for OAuth authentication flows

⚠️ **Important**: Without adding your Vercel URLs to Privy's allowed origins, authentication will fail with CORS errors.

📖 **For detailed configuration instructions, see:** [docs/PRIVY_SETUP.md](../docs/PRIVY_SETUP.md#step-3-configure-privy-dashboard-for-your-vercel-domain)

## Monitoring

### Check Logs

```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

### Analytics

- Vercel provides built-in analytics
- Access via Dashboard → Analytics
- Monitor: Page views, performance, errors

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node version (18+)
- Check build logs for specific errors

### Environment Variables Not Working

- Ensure `NEXT_PUBLIC_*` prefix for client-side vars
- Redeploy after adding env vars
- Clear build cache if issues persist

### Privy Not Loading

- Verify API key is correct
- Check Privy dashboard for allowed origins
- Inspect browser console for errors

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Configure environment variables
3. ✅ Test Privy authentication
4. ✅ Add custom domain
5. 📋 Begin GameFi smart contract development (see `docs/GAMEFI_ARCHITECTURE.md`)

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Privy Docs: https://docs.privy.io
- Project README: See README.md for detailed setup

---

**Ready to launch!** 🎉
