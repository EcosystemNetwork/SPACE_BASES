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

1. Go to [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app or select existing
3. Navigate to Settings → API Keys
4. Copy:
   - **App ID** → Use as `NEXT_PUBLIC_PRIVY_API_KEY`
   - **App Secret** → Use as `PRIVY_APP_SECRET`

### Configure Environment Variables

In Vercel Dashboard:
1. Go to Project Settings
2. Navigate to "Environment Variables"
3. Add both variables:
   ```
   NEXT_PUBLIC_PRIVY_API_KEY=your_app_id_here
   PRIVY_APP_SECRET=your_app_secret_here
   ```
4. Save and redeploy

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

### Update Privy Configuration

1. In Privy Dashboard → Settings
2. Add your Vercel URL to allowed origins:
   - `https://your-project.vercel.app`
   - Your custom domain if configured
3. Save changes

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
