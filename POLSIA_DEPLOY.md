# Polsia Deployment Guide

## 🚀 Deployment Instructions

### Prerequisites
- Node.js 20+
- npm or yarn

### Step 1: Install Dependencies

```bash
cd "Z:\Novaura platform\NovAura-Unified"
npm install
```

### Step 2: Environment Setup

Create `.env` file in root:

```env
# API Configuration
VITE_API_URL=https://api.novauraverse.com
VITE_WS_URL=wss://ws.novauraverse.com

# Firebase (if using)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_APP_ID=your_app_id

# Stripe (for payments)
VITE_STRIPE_PUBLIC_KEY=pk_live_your_key

# AI Services
VITE_AI_ORCHESTRATOR_URL=https://ai.novauraverse.com
VITE_VERTEX_API_KEY=your_vertex_key

# App Config
VITE_APP_NAME=NovaAura Platform
VITE_APP_VERSION=1.0.0
VITE_POLSIA_ENDPOINT=https://polsia.io/deploy
```

### Step 3: Build for Production

```bash
npm run build
```

**Output:** `dist/` folder

### Step 4: Deploy to Polsia

#### Option A: Static Site (Recommended)

```bash
# Upload dist/ folder to Polsia static hosting
polsia deploy --static ./dist --domain novauraverse.com
```

#### Option B: Docker Container

```bash
# Build Docker image
docker build -t novaura-platform .

# Deploy to Polsia
docker push polsia.io/novaura-platform
polsia deploy --container novaura-platform
```

#### Option C: Serverless Functions

```bash
# Deploy as serverless
polsia deploy --serverless --functions ./api --static ./dist
```

---

## 📋 Build Configuration

### vite.config.ts

Already configured with:
- Path aliases (`@/` → `./src`)
- React plugin
- Optimized chunks
- Base path: `./`

### Output Structure

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
└── [public files]
```

---

## 🔧 Health Checks

Add to Polsia config:

```yaml
health_check:
  path: /api/health
  interval: 30s
  timeout: 5s
  retries: 3
```

---

## 📊 Monitoring

Enable in Polsia dashboard:
- Error tracking
- Performance metrics
- User analytics
- Uptime monitoring

---

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Polsia
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - run: polsia deploy --static ./dist
        env:
          POLSIA_TOKEN: ${{ secrets.POLSIA_TOKEN }}
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache
npm run clean
rm -rf node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
npx tsc --noEmit
```

### Out of Memory
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

**Deployment Status:** Ready ✅  
**Last Verified:** 2026-03-15
