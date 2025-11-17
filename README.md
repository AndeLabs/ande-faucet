# ANDE Faucet

Professional faucet service for ANDE Chain - Distribute tokens to developers and users.

![ANDE Chain](https://img.shields.io/badge/ANDE-Chain-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 🌟 Features

- **Professional Backend** - Robust Express + TypeScript API
- **Multi-Layer Security** - IP, address, and global rate limiting
- **Cloudflare Turnstile** - Bot protection with invisible captcha
- **Redis Caching** - Fast rate limit checks and session management
- **Real-time Monitoring** - Prometheus metrics and health checks
- **Admin Dashboard** - Complete control and analytics
- **Production Ready** - Deployed on Vercel with automatic scaling

## 🏗️ Architecture

```
ande-faucet/
├── backend/              # Express API server
│   ├── src/
│   │   ├── config/      # Configuration management
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utilities
│   └── package.json
├── frontend/            # React + Vite frontend (coming soon)
├── api/                 # Vercel serverless entry point
└── vercel.json          # Vercel configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Redis 6+
- ANDE Chain RPC endpoint
- Funded wallet for faucet distribution

### Installation

```bash
# Clone repository
git clone https://github.com/AndeLabs/ande-faucet.git
cd ande-faucet

# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
nano .env
```

### Configuration

Edit `backend/.env`:

```bash
# Required
FAUCET_PRIVATE_KEY=0x...
RPC_URL=https://rpc.ande.network
REDIS_URL=redis://localhost:6379
ADMIN_TOKEN=your_secure_token

# Optional
FAUCET_AMOUNT=10
COOLDOWN_HOURS=24
TURNSTILE_SECRET_KEY=your_cloudflare_key
```

### Development

```bash
# Run backend
cd backend
npm run dev

# Backend runs on http://localhost:3001
```

### Production Deployment

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add FAUCET_PRIVATE_KEY
vercel env add RPC_URL
vercel env add REDIS_URL
vercel env add ADMIN_TOKEN
vercel env add TURNSTILE_SECRET_KEY
```

## 📡 API Endpoints

### Public Endpoints

- `POST /api/faucet/request` - Request tokens
- `GET /api/faucet/info` - Get faucet information
- `GET /api/faucet/stats` - Get statistics
- `GET /api/faucet/cooldown/:address` - Check cooldown
- `GET /api/faucet/health` - Health check

### Admin Endpoints

All require `Authorization: Bearer <ADMIN_TOKEN>` header:

- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/balance` - Wallet balance
- `GET /api/admin/recent-requests` - Recent requests
- `POST /api/admin/reset-rate-limit` - Reset rate limit
- `GET /api/admin/config` - Current configuration
- `POST /api/admin/manual-send` - Manual token send
- `GET /api/admin/metrics` - Prometheus metrics

## 🔒 Security

- **Rate Limiting**
  - IP-based: 5 requests per hour
  - Address-based: 1 request per 24 hours
  - Global: 100 requests per minute

- **Captcha Protection**
  - Cloudflare Turnstile integration
  - Invisible mode for better UX
  - Challenge mode for suspicious activity

- **Request Validation**
  - Address format validation
  - Transaction amount limits
  - Balance verification

## 📊 Monitoring

### Health Checks

```bash
# Basic health
curl https://faucet.ande.network/health

# Detailed health
curl https://faucet.ande.network/api/faucet/health
```

### Metrics

Prometheus metrics available at `/api/admin/metrics`:

- `faucet_requests_total` - Total requests
- `faucet_requests_successful` - Successful distributions
- `faucet_balance` - Current wallet balance
- `faucet_health` - Service health status

## 🎨 Design System

ANDE institutional colors:

- **Orange** (#FF9F1C) - Energy, call-to-action
- **Blue** (#2455B8) - Security, trust
- **Lavender** (#BFA4FF) - Innovation, calm
- **Peach** (#FFC77D) - Warmth, friendliness

## 🛠️ Tech Stack

### Backend
- Express.js - Web framework
- TypeScript - Type safety
- ethers.js v6 - Blockchain interactions
- Redis - Caching and rate limiting
- Winston - Logging
- Helmet - Security headers

### Frontend (Coming Soon)
- React 18 - UI framework
- Vite - Build tool
- TailwindCSS - Styling
- ethers.js - Wallet connection
- React Query - Data fetching

### Infrastructure
- Vercel - Hosting and serverless
- Redis Cloud - Managed Redis
- Cloudflare - Turnstile captcha
- ANDE Chain - Blockchain network

## 📖 Documentation

- [Backend Documentation](./backend/README.md)
- [API Reference](./backend/README.md#api-endpoints)
- [Design System](./DESIGN_SYSTEM.md)

## 🗺️ Roadmap

- [x] Professional backend API
- [x] Multi-layer rate limiting
- [x] Cloudflare Turnstile integration
- [x] Admin endpoints
- [x] Prometheus metrics
- [x] Vercel deployment
- [ ] React frontend
- [ ] Queue system (Bull)
- [ ] PostgreSQL audit logs
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Multi-token support

## 🤝 Contributing

This is an internal ANDE Labs project. For contributions:

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Wait for review

## 📝 Environment Variables

See `backend/.env.example` for all available configuration options.

### Required Variables

- `FAUCET_PRIVATE_KEY` - Private key for faucet wallet
- `RPC_URL` - ANDE Chain RPC endpoint
- `REDIS_URL` - Redis connection string
- `ADMIN_TOKEN` - Admin authentication token

### Optional Variables

- `FAUCET_AMOUNT` - Tokens per request (default: 10)
- `COOLDOWN_HOURS` - Hours between requests (default: 24)
- `TURNSTILE_SECRET_KEY` - Cloudflare secret
- `PORT` - Server port (default: 3001)

## 🐛 Troubleshooting

### Redis Connection

```bash
# Test Redis
redis-cli ping

# Check connection
REDIS_URL=redis://localhost:6379
```

### Blockchain Connection

```bash
# Test RPC
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://rpc.ande.network
```

### Low Balance

```bash
# Check balance
curl https://faucet.ande.network/api/admin/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details.

## 💬 Support

- **Website**: https://ande.network
- **Email**: admin@ande.network
- **Discord**: https://discord.gg/ande
- **Documentation**: https://docs.ande.network

## 🙏 Acknowledgments

Built with ❤️ by the ANDE Labs team.

---

**ANDE Chain** - Building the future of blockchain infrastructure.
