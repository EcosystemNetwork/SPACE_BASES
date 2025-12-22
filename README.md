# 🚀 SPACE_BASES

> A next-generation DeFi platform on Mantle with Privy authentication - Built with Next.js and ready for Vercel deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EcosystemNetwork/SPACE_BASES)

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Development](#development)
- [API Routes](#api-routes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🌟 Overview

SPACE_BASES is a futuristic DeFi/NFT platform built on the Mantle blockchain. It features secure authentication powered by Privy, an intuitive landing page, and a modular architecture designed for scalability.

This project is a Next.js application with TypeScript, optimized for deployment on Vercel with server-side API routes for secure authentication.

## ✨ Features

- 🔐 **Privy Authentication** - Secure, user-friendly wallet connection and authentication
- ⚡ **Lightning Fast** - Built on Mantle for high-speed, low-cost transactions
- 🎨 **Beautiful UI** - Modern, animated landing page with glassmorphism effects
- 🌐 **Decentralized** - True Web3 architecture with no single point of failure
- 💎 **NFT Ready** - Infrastructure prepared for NFT integration
- 🛠️ **Developer Friendly** - Clean code, comprehensive documentation, easy to extend
- 🚀 **Vercel Ready** - One-click deployment with optimized configuration

## 🛠 Tech Stack

- **Framework**: [Next.js 14.2.0](https://nextjs.org/)
- **Language**: [TypeScript 5.5.6](https://www.typescriptlang.org/)
- **UI Library**: [React 18.2.0](https://react.dev/)
- **Authentication**: [Privy](https://privy.io/)
- **Blockchain**: [Mantle Network](https://www.mantle.xyz/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Styling**: Custom CSS with animations

## 📁 Project Structure

```
SPACE_BASES/
├── pages/
│   ├── api/
│   │   └── auth/
│   │       └── privy/
│   │           └── verify.ts          # Server-side Privy token verification
│   ├── _app.tsx                       # Next.js app wrapper
│   └── index.tsx                      # Main landing page
├── styles/
│   └── globals.css                    # Global styles and animations
├── .env.example                       # Environment variable template
├── .gitignore                         # Git ignore rules
├── next.config.mjs                    # Next.js configuration
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── vercel.json                        # Vercel deployment configuration
└── README.md                          # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Privy account (sign up at https://dashboard.privy.io)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EcosystemNetwork/SPACE_BASES.git
   cd SPACE_BASES
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Privy credentials:
   ```env
   NEXT_PUBLIC_PRIVY_API_KEY=your_public_privy_api_key_here
   PRIVY_APP_SECRET=your_privy_app_secret_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Required | Public |
|----------|-------------|----------|--------|
| `NEXT_PUBLIC_PRIVY_API_KEY` | Your Privy public API key | ✅ (unless using mock mode) | Yes |
| `PRIVY_APP_SECRET` | Your Privy app secret for server-side verification | ✅ (unless using mock mode) | No |
| `NEXT_PUBLIC_MOCK_AUTH` | Enable mock authentication mode (set to 'true') | ❌ | Yes |

⚠️ **Important**: 
- Never commit the `.env` file to version control
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `PRIVY_APP_SECRET` must be kept secure (server-side only)

### Mock Authentication Mode (Development)

For development without requiring real wallet connections, you can enable mock authentication:

1. Create a `.env` file with:
   ```env
   NEXT_PUBLIC_MOCK_AUTH=true
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The app will use mock authentication with a test user account, allowing you to develop and test app flows without connecting to Privy or real wallets.

### Getting Privy Credentials (Production)

1. Visit [Privy Dashboard](https://dashboard.privy.io)
2. Create a new app or select an existing one
3. Copy your API Key (for `NEXT_PUBLIC_PRIVY_API_KEY`)
4. Copy your App Secret (for `PRIVY_APP_SECRET`)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **One-Click Deploy**
   
   Click the button below to deploy to Vercel:
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EcosystemNetwork/SPACE_BASES)

2. **Manual Deploy**
   
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure Environment Variables**
   
   In your Vercel project dashboard:
   - Go to Settings → Environment Variables
   - Add `NEXT_PUBLIC_PRIVY_API_KEY`
   - Add `PRIVY_APP_SECRET`
   - Redeploy the project

### Deploy to Other Platforms

The project is a standard Next.js application and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- Any platform that supports Node.js

## 💻 Development

### Available Scripts

```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Project Architecture

#### Frontend (`pages/index.tsx`)
- React-based landing page with TypeScript
- Dynamic Privy widget loading
- Client-side authentication flow
- Responsive design with animations

#### Styles (`styles/globals.css`)
- CSS custom properties for theming
- Animated starfield background
- Glassmorphism card effects
- Mobile-responsive breakpoints

#### API Routes (`pages/api/auth/privy/verify.ts`)
- Server-side token verification
- Privy API integration
- Error handling and validation
- Secure secret management

### Adding New Features

1. **New Pages**: Add `.tsx` files to `pages/` directory
2. **New API Routes**: Add files to `pages/api/`
3. **Styling**: Extend `styles/globals.css` or create component-specific CSS
4. **Components**: Create reusable components in a new `components/` directory

## 🔌 API Routes

### POST `/api/auth/privy/verify`

Verifies a Privy authentication token.

**Request Body:**
```json
{
  "token": "user_privy_session_token"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: `Module not found: Can't resolve 'next'`
- **Solution**: Run `npm install` to install all dependencies

**Issue**: `PRIVY_APP_SECRET not found`
- **Solution**: Create `.env` file and add your Privy credentials

**Issue**: Privy widget not loading
- **Solution**: Check console for errors, verify `NEXT_PUBLIC_PRIVY_API_KEY` is set correctly

**Issue**: Build fails on Vercel
- **Solution**: Ensure environment variables are set in Vercel dashboard

**Issue**: TypeScript errors
- **Solution**: Run `npm install` to ensure dev dependencies are installed

### Development Tips

- Use `console.log` for debugging - check browser console
- Check Network tab in DevTools for API request/response
- Verify `.env` file exists and has correct values
- Ensure no conflicting processes on port 3000

## 🤝 Contributing

We welcome contributions from other developers and bots!

### For Human Developers

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### For AI Assistants/Bots

When making changes to this project:

1. **Understand the structure**: Review the Project Structure section
2. **Follow conventions**: 
   - TypeScript for all `.ts`/`.tsx` files
   - Functional components with hooks in React
   - CSS custom properties in `styles/globals.css`
3. **Test changes**: Always run `npm run build` before committing
4. **Update docs**: If adding features, update this README
5. **Environment**: Never commit secrets, use `.env` for sensitive data

### Code Style

- Use TypeScript strict mode features
- Follow React best practices (hooks, functional components)
- Write descriptive commit messages
- Keep components small and focused
- Comment complex logic

## 📄 License

This project is private and proprietary. All rights reserved.

## 🔗 Links

- [Privy Documentation](https://docs.privy.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Mantle Network](https://www.mantle.xyz/)
- [Vercel Documentation](https://vercel.com/docs)

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the Troubleshooting section
- Review Privy documentation for authentication issues

---

Built with ❤️ for the future of decentralized finance