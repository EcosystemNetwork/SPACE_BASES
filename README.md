# 🚀 SPACE_BASES

> A next-generation DeFi prototype on Mantle with mock wallet authentication - Built with Next.js and ready for Vercel deployment

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
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🌟 Overview

SPACE_BASES is a futuristic DeFi/NFT platform built on the Mantle blockchain. The current build focuses on a mock wallet authentication flow so you can prototype product journeys quickly without waiting on real wallet integrations.

This project is a Next.js application with TypeScript, optimized for deployment on Vercel with a lightweight landing experience.

## ✨ Features

- 🔐 **Mock Wallet Authentication** - Fast, no-setup login for prototyping
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
- **Blockchain**: [Mantle Network](https://www.mantle.xyz/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Styling**: Custom CSS with animations

## 📁 Project Structure

```
SPACE_BASES/
├── pages/
│   ├── _app.tsx                       # Next.js app wrapper with mock auth provider
│   └── index.tsx                      # Main landing page
├── styles/
│   └── globals.css                    # Global styles and animations
├── .env.example                       # Environment variable template (currently empty)
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

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

No environment variables are required for the current mock wallet flow. When you are ready to integrate a real wallet provider, add the necessary credentials to a `.env` file and load them via `process.env`.

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

3. **Environment Variables**
   
   None are required for the mock wallet prototype. Add credentials only when integrating a real wallet solution.

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
- Mock wallet login to unblock prototyping
- Responsive design with animations

#### Styles (`styles/globals.css`)
- CSS custom properties for theming
- Animated starfield background
- Glassmorphism card effects
- Mobile-responsive breakpoints

## 🐛 Troubleshooting

### Common Issues

**Issue**: `Module not found: Can't resolve 'next'`
- **Solution**: Run `npm install` to install all dependencies

**Issue**: Build fails on Vercel
- **Solution**: Ensure the project builds locally with `npm run build` before deploying

**Issue**: TypeScript errors
- **Solution**: Run `npm install` to ensure dev dependencies are installed

### Development Tips

- Use `console.log` for debugging - check browser console
- Check Network tab in DevTools for API request/response
- Keep components focused and small for maintainability
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
3. **Test changes**: Run `npm run build` before committing
4. **Update docs**: If adding features, update this README
5. **Environment**: Never commit secrets; add them to `.env` when real integrations are added

### Code Style

- Use TypeScript strict mode features
- Follow React best practices (hooks, functional components)
- Write descriptive commit messages
- Keep components small and focused
- Comment complex logic

## 📄 License

This project is private and proprietary. All rights reserved.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Mantle Network](https://www.mantle.xyz/)
- [Vercel Documentation](https://vercel.com/docs)

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the Troubleshooting section

---

Built with ❤️ for the future of decentralized finance
