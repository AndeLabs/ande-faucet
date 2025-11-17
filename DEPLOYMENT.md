# ANDE Faucet - Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites

1. Vercel account (https://vercel.com)
2. GitHub repository access
3. Required environment variables ready

### Step 1: Import Project to Vercel

**Option A: Via Vercel Dashboard**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `AndeLabs/ande-faucet`
4. Click "Import"

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd /Users/munay/dev/ande-labs/ande-faucet
vercel
```

### Step 2: Configure Build Settings

Vercel should auto-detect the configuration from `vercel.json`, but verify:

- **Framework Preset**: Other
- **Build Command**: `cd backend && npm install && npm run build`
- **Output Directory**: `backend/dist`
- **Install Command**: `cd backend && npm install`

### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

#### Required Variables

```bash
FAUCET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
RPC_URL=https://rpc.ande.network
REDIS_URL=redis://your-redis-url:6379
ADMIN_TOKEN=your_secure_random_token_here
```

#### Captcha Variables

```bash
TURNSTILE_ENABLED=true
TURNSTILE_SECRET_KEY=your_cloudflare_turnstile_secret
TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

#### Optional Variables

```bash
# Blockchain
CHAIN_ID=6174
FAUCET_AMOUNT=10
COOLDOWN_HOURS=24
GAS_LIMIT=21000
GAS_PRICE_MULTIPLIER=1.2

# Rate Limiting
RATE_LIMIT_IP_MAX_REQUESTS=5
RATE_LIMIT_ADDRESS_MAX_REQUESTS=1
RATE_LIMIT_IP_WINDOW_MS=3600000
RATE_LIMIT_ADDRESS_WINDOW_MS=86400000

# Monitoring
PROMETHEUS_ENABLED=true
ALERT_LOW_BALANCE_THRESHOLD=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Step 4: Deploy

Click "Deploy" in Vercel dashboard or run:

```bash
vercel --prod
```

### Step 5: Configure Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `faucet.ande.network`
3. Follow DNS configuration instructions
4. Add CNAME record in your DNS provider:
   ```
   faucet  CNAME  cname.vercel-dns.com
   ```

### Step 6: Verify Deployment

Test endpoints:

```bash
# Health check
curl https://faucet.ande.network/health

# Faucet info
curl https://faucet.ande.network/api/faucet/info

# Stats
curl https://faucet.ande.network/api/faucet/stats
```

## 🔧 Environment Setup Guide

### 1. Redis Setup (Upstash Recommended)

**Upstash Redis** (Serverless, perfect for Vercel):

1. Go to https://upstash.com
2. Create account and database
3. Select region closest to Vercel deployment (us-east-1)
4. Copy connection string
5. Add to Vercel: `REDIS_URL=redis://...`

**Alternative: Redis Cloud**

1. Go to https://redis.com/cloud
2. Create free database
3. Enable TLS
4. Copy connection string with password
5. Add to Vercel

### 2. Cloudflare Turnstile Setup

1. Go to https://dash.cloudflare.com
2. Navigate to Turnstile
3. Create new site:
   - **Site name**: ANDE Faucet
   - **Domain**: faucet.ande.network
   - **Widget mode**: Invisible (recommended)
4. Copy Site Key and Secret Key
5. Add to Vercel:
   ```
   TURNSTILE_SITE_KEY=0x4AAAAAAA...
   TURNSTILE_SECRET_KEY=0x4AAAAAAA...
   ```

### 3. Faucet Wallet Setup

**IMPORTANT: Use a dedicated wallet for the faucet**

```bash
# Option 1: Create new wallet
# Use MetaMask, export private key

# Option 2: Use existing funded wallet
# Export private key (KEEP SECURE!)

# Add to Vercel (NEVER commit to git)
FAUCET_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

**Security Best Practices:**
- Use a dedicated wallet ONLY for faucet
- Fund with limited amount (e.g., 1000 ANDE)
- Monitor balance regularly
- Rotate keys periodically
- Enable low balance alerts

### 4. Admin Token Generation

Generate a secure random token:

```bash
# Option 1: OpenSSL
openssl rand -hex 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Add to Vercel:
```bash
ADMIN_TOKEN=your_generated_token_here
```

## 📊 Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Health check endpoint working
- [ ] Redis connection successful
- [ ] Blockchain RPC connection working
- [ ] Faucet wallet has sufficient balance
- [ ] Captcha working correctly
- [ ] Rate limiting functional
- [ ] Admin endpoints protected
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring alerts configured

## 🔍 Monitoring & Maintenance

### Health Checks

Add these to your monitoring:

```bash
# Basic health
curl https://faucet.ande.network/health

# Detailed health
curl https://faucet.ande.network/api/faucet/health

# Balance check (requires admin token)
curl https://faucet.ande.network/api/admin/balance \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Metrics Monitoring

Set up Prometheus scraping:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'ande-faucet'
    static_configs:
      - targets: ['faucet.ande.network']
    metrics_path: '/api/admin/metrics'
    bearer_token: 'YOUR_ADMIN_TOKEN'
```

### Log Monitoring

View logs in Vercel Dashboard:
1. Go to Deployments
2. Click on deployment
3. View "Functions" tab
4. Check logs for errors

## 🐛 Troubleshooting

### Deployment Fails

1. Check build logs in Vercel
2. Verify all dependencies in package.json
3. Ensure TypeScript compiles locally:
   ```bash
   cd backend
   npm run build
   ```

### Redis Connection Issues

1. Verify REDIS_URL format
2. Check Redis dashboard for connection errors
3. Ensure Redis is in same region as Vercel function
4. Test connection locally:
   ```bash
   redis-cli -u $REDIS_URL ping
   ```

### Blockchain Connection Issues

1. Test RPC endpoint:
   ```bash
   curl -X POST https://rpc.ande.network \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```
2. Check RPC rate limits
3. Configure fallback RPC

### Rate Limit Not Working

1. Verify Redis connection
2. Check Redis TTL settings
3. Clear Redis cache if needed:
   ```bash
   # In Redis CLI
   FLUSHDB
   ```

### Low Balance Alerts

1. Check current balance:
   ```bash
   curl https://faucet.ande.network/api/admin/balance \
     -H "Authorization: Bearer TOKEN"
   ```
2. Fund wallet if needed
3. Adjust `ALERT_LOW_BALANCE_THRESHOLD`

## 🔐 Security Recommendations

1. **Never commit secrets**
   - Use .env files (in .gitignore)
   - Store in Vercel environment variables

2. **Rotate credentials regularly**
   - Admin tokens: monthly
   - Faucet private key: quarterly
   - API keys: as needed

3. **Monitor for abuse**
   - Check metrics daily
   - Set up alerts for unusual activity
   - Review recent requests

4. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

5. **Enable CORS properly**
   - Only whitelist known domains
   - Update `CORS_ORIGIN` in production

## 📱 Mobile/PWA Considerations

For future frontend:

1. Configure CORS for mobile apps
2. Add rate limiting for mobile IPs
3. Implement wallet connection for mobile
4. Test on various devices

## 🌐 Multi-Region Deployment

For global distribution:

1. Deploy to multiple Vercel regions
2. Use Cloudflare for global CDN
3. Configure geo-routing
4. Monitor latency per region

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review application logs
3. Test locally first
4. Contact ANDE Labs team

---

**Ready to deploy!** 🚀

Follow this guide step by step for a successful deployment.
