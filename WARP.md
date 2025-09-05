# WARP.md

Remember not to change my file structure or the way bot works or looks like, it is a profeessional live real money and paper, self learning, self evolve, trading live data, this symbolic, synthetic, live intelegice bot took me months to build dp please dont shane or try not to change a thing it have to have a live login so that public cant log in and steel my money some time I will sell it so otheres can use it too.

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Repository Overview

This is the AuraQuant frontend - a Synthetic Intelligence Trading Platform frontend built with vanilla JavaScript, HTML, and CSS. The application provides a web interface for an algorithmic trading bot with real-time WebSocket connections.

## Architecture

### Frontend Structure
- **Vanilla JavaScript Application**: No framework dependencies, pure JS/HTML/CSS
- **Module-based Architecture**: Separate manager classes for different concerns
  - `AuthManager` (js/auth.js): Handles authentication, token management, and session persistence
  - `WebSocketManager` (js/websocket.js): Manages real-time WebSocket connections with automatic reconnection
  - `TradingManager` (js/trading.js): Handles trade execution and history retrieval
  - `AuraQuantApp` (js/app.js): Main application orchestrator
- **Configuration**: Centralized in `js/config.js` pointing to backend services
- **Static Asset Deployment**: Designed for CDN/edge deployment (Cloudflare)

### Backend Integration
- Backend API: `https://auraquant-backend.onrender.com` (deployed on Render)
- WebSocket endpoint: `wss://auraquant-backend.onrender.com`
- Authentication: JWT-based with localStorage persistence
- CORS configured for cross-origin requests

## Common Development Commands

### Local Development
```bash
# Serve the frontend locally (requires any static server)
npx http-server -p 8080

# Or use Python's built-in server
python -m http.server 8080

# Or use PHP's built-in server
php -S localhost:8080
```

### Deployment Commands

#### Deploy to Cloudflare (Primary Frontend Host)
```bash
# Login to Cloudflare (first time only)
wrangler login

# Deploy to Cloudflare Pages/Workers
wrangler pages deploy . --project-name auraquant-frontend

# Or if using Workers
wrangler deploy
```

#### Deploy via Git Push
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Update: [feature description]"

# Push to GitHub (triggers Render backend auto-deploy if configured)
git push origin main

# Force push if needed (use cautiously)
git push origin main --force
```

### Git Operations
```bash
# Check current status
git status

# View remote repositories
git remote -v

# Pull latest changes
git pull origin main

# Resolve rebase conflicts
git rebase --continue  # After fixing conflicts
git rebase --abort     # To cancel rebase

# View commit history
git log --oneline -10
```

## Security Headers Configuration

The `_headers` file configures security headers for Cloudflare deployment:
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff (prevents MIME sniffing)
- X-XSS-Protection: 1; mode=block (XSS protection)
- CSP: Restricts content sources to self and specific backend URLs

## Key Files and Their Purpose

- **index.html**: Main entry point, loads all JavaScript modules in sequence
- **js/config.js**: Central configuration for API endpoints
- **js/app.js**: Main application controller, manages UI states (login/dashboard)
- **js/auth.js**: Authentication logic, token management
- **js/websocket.js**: Real-time data connection management
- **js/trading.js**: Trading operations API interface
- **_headers**: Cloudflare security headers configuration
- **.wrangler/**: Cloudflare deployment cache (gitignored)

## Deployment Workflow

1. **Frontend Changes**: 
   - Edit files locally
   - Test with local server
   - Commit to Git
   - Deploy to Cloudflare using `wrangler deploy`

2. **Backend API URL Changes**:
   - Update `CONFIG.API_URL` and `CONFIG.WS_URL` in `js/config.js`
   - Ensure CORS is configured on backend for new frontend URL

3. **Authentication Flow**:
   - User credentials → Backend API → JWT token
   - Token stored in localStorage
   - Token sent with API requests via Authorization header
   - WebSocket authenticated after connection

## WebSocket Connection Management

The WebSocket manager implements:
- Automatic reconnection with exponential backoff (max 5 attempts)
- Authentication on connection
- JSON message parsing
- Connection state management

## API Integration Points

- **Authentication**: `/api/auth/login` (POST)
- **Trading**: `/api/trade/execute` (POST), `/api/trade/history` (GET)
- **Health Check**: `/api/health` (GET) - for monitoring
- **WebSocket**: Real-time data feed at `wss://` endpoint

## Related Repositories

- **Backend**: `auraquant-backend` - Node.js/Express API server deployed on Render
- **Parent Project**: Contains deployment scripts (`deploy.sh`, `setup-deploy.sh`)

## Deployment Platforms

- **Frontend**: Cloudflare Pages/Workers (primary)
- **Backend**: Render.com (primary)
- **Repository**: GitHub (wayneroberts32/auraquant-frontend)

## Testing Checklist

When deploying or making changes, verify:
- [ ] Login functionality works
- [ ] WebSocket connects and authenticates
- [ ] Trading panel loads correctly
- [ ] API calls return expected data
- [ ] Security headers are properly set
- [ ] CORS is correctly configured
- [ ] Session persistence works (refresh maintains login)
