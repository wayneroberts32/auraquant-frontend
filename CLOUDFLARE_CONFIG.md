# Cloudflare Configuration Guide for AuraQuant

## Current Deployment Status
- **Frontend URL**: https://4535635e.auraquant-frontend.pages.dev
- **Backend API**: https://auraquant-backend.onrender.com
- **Account ID**: 2e471ad68f4782901db1939103c7c074

-**Remember not to change my file structure or the way bot works or looks like, it is a profeessional live real money and paper, self learning, self evolve, trading live data, this symbolic, synthetic, live intelegice bot took me months to build dp please dont shane or try not to change a thing it have to have a live login so that public cant log in and steel my money some time I will sell it so otheres can use it too.

This file prov

## DNS Configuration (via Cloudflare Dashboard)

### For Custom Domain Setup:
1. Go to Cloudflare Dashboard → Your Domain → DNS
2. Add these records:

```
Type: CNAME
Name: @ or auraquant
Target: auraquant-frontend.pages.dev
Proxy: Enabled (Orange Cloud)
TTL: Auto

Type: CNAME  
Name: www
Target: auraquant-frontend.pages.dev
Proxy: Enabled (Orange Cloud)
TTL: Auto

Type: TXT (for domain verification)
Name: _cf-pages-auth
Value: auraquant-frontend.pages.dev
TTL: Auto
```

## Security Settings (via Cloudflare Dashboard)

### 1. SSL/TLS Configuration
- **SSL Mode**: Full (Strict)
- **Always Use HTTPS**: ON
- **Automatic HTTPS Rewrites**: ON
- **Minimum TLS Version**: 1.2

### 2. Security → Settings
- **Security Level**: Medium
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: ON
- **Privacy Pass Support**: ON

### 3. Firewall Rules
Create these WAF rules:

**Rule 1: Block Common Attacks**
```
Expression: (http.request.uri.path contains "/wp-admin" or 
            http.request.uri.path contains "/.env" or
            http.request.uri.path contains "/phpmyadmin")
Action: Block
```

**Rule 2: Rate Limiting for API**
```
Expression: (http.request.uri.path contains "/api/")
Action: Challenge
Rate: 10 requests per minute per IP
```

**Rule 3: Geo-blocking (Optional)**
```
Expression: (ip.geoip.country ne "US" and ip.geoip.country ne "CA")
Action: Challenge or Block (based on preference)
```

### 4. Page Rules
**Rule 1: API Caching**
```
URL: *auraquant.com/api/*
Cache Level: Bypass
Security Level: High
```

**Rule 2: Static Assets**
```
URL: *auraquant.com/assets/*
Cache Level: Standard
Browser Cache TTL: 1 month
Edge Cache TTL: 1 month
```

### 5. DDoS Protection
- **DDoS Alert Sensitivity**: High
- **HTTP DDoS Attack Protection**: ON
- **Advanced DDoS Protection**: Enabled

### 6. Bot Management
- **Bot Fight Mode**: ON
- **Verified Bot Access**: Allow
- **JavaScript Detections**: ON

## CORS Configuration
Already handled in `_headers` file:
- Allows connections from self
- Allows API connections to Render backend
- WebSocket connections enabled

## Environment Variables (Set in Cloudflare Pages)
Go to Pages → auraquant-frontend → Settings → Environment Variables:

```
API_URL = https://auraquant-backend.onrender.com
WS_URL = wss://auraquant-backend.onrender.com
NODE_ENV = production
```

## Deployment Commands

### Initial Deployment
```bash
wrangler pages deploy . --project-name=auraquant-frontend
```

### Update Deployment
```bash
# Commit changes first
git add .
git commit -m "Update: [description]"
git push origin main

# Then deploy
wrangler pages deploy . --project-name=auraquant-frontend --branch=main
```

### Deploy to Staging
```bash
wrangler pages deploy . --project-name=auraquant-frontend --branch=staging
```

## Custom Domain Connection

### Via Wrangler CLI:
```bash
# Add custom domain
wrangler pages project create auraquant-frontend --production-branch=main

# Connect domain
wrangler pages deployment create --project-name=auraquant-frontend
```

### Via Dashboard:
1. Go to Cloudflare Pages
2. Select `auraquant-frontend` project
3. Go to Custom domains tab
4. Click "Set up a custom domain"
5. Enter your domain: `auraquant.com`
6. Follow verification steps

## Health Checks & Monitoring

### Frontend Health Check
```bash
curl https://4535635e.auraquant-frontend.pages.dev
```

### Backend API Health Check
```bash
curl https://auraquant-backend.onrender.com/api/health
```

### WebSocket Test
```javascript
// Browser console test
const ws = new WebSocket('wss://auraquant-backend.onrender.com');
ws.onopen = () => console.log('WebSocket connected');
ws.onmessage = (e) => console.log('Message:', e.data);
```

## Troubleshooting

### DNS Propagation
- Use `nslookup auraquant.com` to verify DNS
- Check propagation: https://dnschecker.org

### CORS Issues
- Verify backend allows frontend origin
- Check browser console for CORS errors
- Ensure _headers file is deployed

### SSL Certificate Issues
- Wait 24 hours for certificate provisioning
- Verify domain ownership in Cloudflare
- Check SSL/TLS settings are set to Full (Strict)

### Cache Issues
```bash
# Purge cache via dashboard or CLI
wrangler pages deployment tail --project-name=auraquant-frontend
```

## Security Checklist
- [ ] SSL/TLS enabled and forced
- [ ] Security headers configured in _headers
- [ ] Rate limiting active
- [ ] DDoS protection enabled
- [ ] Bot protection configured
- [ ] Firewall rules created
- [ ] Minimum TLS version set to 1.2+
- [ ] DNSSEC enabled (optional but recommended)

## Important URLs
- **Production Frontend**: https://4535635e.auraquant-frontend.pages.dev
- **Backend API**: https://auraquant-backend.onrender.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Pages Project**: https://dash.cloudflare.com/?to=/:account/pages/view/auraquant-frontend

## Notes
- The backend on Render auto-deploys from GitHub pushes
- Frontend requires manual deployment via wrangler or GitHub integration
- WebSocket connections require wss:// protocol for secure connections
- All trading bot logic remains unchanged - only deployment configuration modified
