# ANDE Faucet Backend

Professional backend service for distributing ANDE tokens to developers and users.

## Features

✨ **Professional Grade**
- Multi-layer rate limiting (IP, address, global)
- Cloudflare Turnstile captcha integration
- Redis caching and session management
- Comprehensive error handling and logging
- Transaction monitoring and alerting

🔒 **Security**
- Helmet.js security headers
- CORS protection
- Request validation
- Admin authentication
- Rate limit bypass protection

📊 **Monitoring**
- Prometheus metrics
- Health check endpoints
- Real-time transaction tracking
- Low balance alerts
- Comprehensive logging with Winston

⚡ **Performance**
- Redis caching
- Connection pooling
- Optimized gas price calculation
- Fallback RPC provider
- Request timeout handling

## Architecture

```
backend/
├── src/
│   ├── config/          # Centralized configuration
│   ├── services/        # Business logic
│   │   ├── blockchain.service.ts    # Ethereum interactions
│   │   ├── redis.service.ts         # Caching & rate limiting
│   │   ├── captcha.service.ts       # Cloudflare Turnstile
│   │   └── faucet.service.ts        # Main orchestration
│   ├── routes/          # API endpoints
│   │   ├── faucet.routes.ts         # Public endpoints
│   │   └── admin.routes.ts          # Admin endpoints
│   ├── middleware/      # Express middleware
│   │   └── rateLimit.middleware.ts
│   ├── utils/           # Utilities
│   │   └── logger.ts                # Winston logger
│   └── index.ts         # Express app
├── package.json
├── tsconfig.json
└── .env.example
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Redis 6+
- ANDE Chain RPC endpoint
- Funded wallet for faucet

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Configuration

Edit `.env` file with your settings:

```bash
# Required
FAUCET_PRIVATE_KEY=0x...
RPC_URL=https://rpc.ande.network
REDIS_URL=redis://localhost:6379
ADMIN_TOKEN=your_secure_token

# Optional
TURNSTILE_SECRET_KEY=your_cloudflare_key
FAUCET_AMOUNT=10
COOLDOWN_HOURS=24
```

### Development

```bash
# Run in development mode with auto-reload
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm run start:prod
```

## API Endpoints

### Public Endpoints

#### POST /api/faucet/request
Request tokens from faucet

**Request:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "captchaToken": "turnstile_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "10",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /api/faucet/info
Get faucet information

**Response:**
```json
{
  "success": true,
  "data": {
    "chainId": 6174,
    "faucetAddress": "0x...",
    "faucetBalance": "1000.0",
    "amount": "10",
    "cooldownHours": 24
  }
}
```

#### GET /api/faucet/stats
Get faucet statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRequests": 1234,
    "successfulRequests": 1200,
    "failedRequests": 34,
    "totalTokensDistributed": "12000",
    "uptime": 86400
  }
}
```

#### GET /api/faucet/cooldown/:address
Check cooldown status for address

**Response:**
```json
{
  "success": true,
  "data": {
    "canRequest": false,
    "cooldownEndsAt": "2024-01-16T10:30:00.000Z",
    "remainingTime": 82800000
  }
}
```

#### GET /api/faucet/health
Health check endpoint

**Response:**
```json
{
  "success": true,
  "data": {
    "healthy": true,
    "blockchain": true,
    "redis": true,
    "captcha": true
  }
}
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <ADMIN_TOKEN>` header.

#### GET /api/admin/dashboard
Get comprehensive dashboard data

#### GET /api/admin/balance
Get detailed faucet wallet balance

#### GET /api/admin/recent-requests
Get recent faucet requests

Query params:
- `limit`: Number of requests to return (default: 50)

#### POST /api/admin/reset-rate-limit
Reset rate limit for IP or address

**Request:**
```json
{
  "type": "ip",
  "value": "192.168.1.1"
}
```

#### GET /api/admin/config
Get current faucet configuration

#### POST /api/admin/manual-send
Manually send tokens (emergency use)

**Request:**
```json
{
  "address": "0x...",
  "amount": 10
}
```

#### GET /api/admin/metrics
Get Prometheus-compatible metrics

## Rate Limiting

### IP-based Rate Limit
- **Window**: 1 hour
- **Max Requests**: 5
- Prevents spam from single IP

### Address-based Rate Limit
- **Window**: 24 hours
- **Max Requests**: 1
- Ensures fair distribution

### Global Rate Limit
- **Window**: 1 minute
- **Max Requests**: 100
- Protects against DDoS

## Security Best Practices

1. **Private Key Management**
   - Never commit private keys
   - Use environment variables
   - Rotate keys periodically
   - Use hardware wallets in production

2. **Admin Token**
   - Use strong, random tokens
   - Rotate regularly
   - Store securely (e.g., HashiCorp Vault)
   - Never expose in logs

3. **CORS Configuration**
   - Whitelist specific origins
   - Avoid wildcards in production
   - Enable credentials carefully

4. **Redis Security**
   - Use password authentication
   - Enable TLS in production
   - Restrict network access
   - Regular backups

## Monitoring

### Health Checks

```bash
# Basic health check
curl http://localhost:3001/health

# Detailed faucet health
curl http://localhost:3001/api/faucet/health

# Blockchain status (admin)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/dashboard
```

### Metrics

Prometheus metrics available at `/api/admin/metrics`:

- `faucet_requests_total` - Total requests
- `faucet_requests_successful` - Successful requests
- `faucet_requests_failed` - Failed requests
- `faucet_tokens_distributed` - Total tokens distributed
- `faucet_balance` - Current faucet balance
- `faucet_health` - Health status (1=healthy, 0=unhealthy)

### Logs

Logs are written to:
- Console (development)
- `logs/faucet.log` (production)

Log levels:
- `error` - Errors and failures
- `warn` - Warnings and alerts
- `info` - General information
- `debug` - Detailed debugging info

## Environment Variables

See `.env.example` for complete list of configuration options.

### Required Variables

- `FAUCET_PRIVATE_KEY` - Private key for faucet wallet
- `RPC_URL` - ANDE Chain RPC endpoint
- `REDIS_URL` - Redis connection string
- `ADMIN_TOKEN` - Admin authentication token

### Optional Variables

- `FAUCET_AMOUNT` - Tokens per request (default: 10)
- `COOLDOWN_HOURS` - Hours between requests (default: 24)
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret
- `PORT` - Server port (default: 3001)
- `LOG_LEVEL` - Logging level (default: info)

## Troubleshooting

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Check Redis logs
docker logs redis

# Verify Redis URL in .env
REDIS_URL=redis://localhost:6379
```

### Blockchain Connection Issues

```bash
# Test RPC endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://rpc.ande.network

# Check fallback RPC
RPC_FALLBACK_URL=https://rpc-backup.ande.network
```

### Low Balance Alerts

Monitor faucet balance:

```bash
# Check balance
curl http://localhost:3001/api/admin/balance \
  -H "Authorization: Bearer YOUR_TOKEN"

# Set alert threshold in .env
ALERT_LOW_BALANCE_THRESHOLD=100
```

### Rate Limit Issues

Reset rate limits:

```bash
# Reset IP rate limit
curl -X POST http://localhost:3001/api/admin/reset-rate-limit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"ip","value":"192.168.1.1"}'

# Reset address rate limit
curl -X POST http://localhost:3001/api/admin/reset-rate-limit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"address","value":"0x..."}'
```

## Performance Optimization

### Redis Caching

```bash
# Monitor cache hit rate
redis-cli info stats | grep keyspace

# Adjust TTL
CACHE_TTL=300
```

### Gas Optimization

```bash
# Adjust gas price multiplier
GAS_PRICE_MULTIPLIER=1.2

# Set max gas price
MAX_FEE_PER_GAS=20000000000
```

### Connection Pooling

```bash
# Redis pool settings
REDIS_POOL_MIN=2
REDIS_POOL_MAX=10
```

## Development Roadmap

- [x] Core faucet functionality
- [x] Rate limiting
- [x] Captcha integration
- [x] Admin panel
- [x] Prometheus metrics
- [ ] Bull queue system
- [ ] PostgreSQL audit logs
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Multi-token support

## Contributing

This is an internal ANDE Labs project. For issues or suggestions, contact the development team.

## License

MIT License - See LICENSE file for details.

## Support

For support, contact:
- Email: admin@ande.network
- Discord: https://discord.gg/ande
- Documentation: https://docs.ande.network
