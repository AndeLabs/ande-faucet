import { Router, Request, Response, NextFunction } from 'express';
import { FaucetService } from '../services/faucet.service';
import { BlockchainService } from '../services/blockchain.service';
import { RedisService } from '../services/redis.service';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();
const faucetService = new FaucetService();
const blockchainService = new BlockchainService();
const redisService = new RedisService();

/**
 * Admin authentication middleware
 * Simple token-based auth for admin endpoints
 */
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid authorization header'
    });
  }

  const token = authHeader.substring(7);
  const adminToken = config.admin.token;

  if (!adminToken) {
    logger.error('Admin token not configured');
    return res.status(500).json({
      success: false,
      error: 'Admin authentication not configured'
    });
  }

  if (token !== adminToken) {
    logger.warn('Invalid admin token attempt', {
      ip: req.ip || req.socket.remoteAddress
    });
    return res.status(403).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }

  next();
};

// Apply admin auth to all admin routes
router.use(adminAuth);

/**
 * GET /api/admin/dashboard
 * Get comprehensive dashboard data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [stats, info, health] = await Promise.all([
      faucetService.getStats(),
      faucetService.getFaucetInfo(),
      faucetService.healthCheck()
    ]);

    return res.json({
      success: true,
      data: {
        stats,
        info,
        health,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get dashboard data', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data'
    });
  }
});

/**
 * GET /api/admin/balance
 * Get detailed faucet wallet balance
 */
router.get('/balance', async (req: Request, res: Response) => {
  try {
    const balance = await blockchainService.getBalance();
    const address = await blockchainService.getAddress();
    
    return res.json({
      success: true,
      data: {
        address,
        balance,
        balanceFormatted: `${balance} ANDE`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get balance', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve balance'
    });
  }
});

/**
 * GET /api/admin/recent-requests
 * Get recent faucet requests
 */
router.get('/recent-requests', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const requests = await faucetService.getRecentRequests(limit);
    
    return res.json({
      success: true,
      data: {
        requests,
        count: requests.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get recent requests', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recent requests'
    });
  }
});

/**
 * POST /api/admin/reset-rate-limit
 * Reset rate limit for a specific IP or address
 */
router.post('/reset-rate-limit', async (req: Request, res: Response) => {
  try {
    const { type, value } = req.body;

    if (!type || !value) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and value'
      });
    }

    if (!['ip', 'address'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "ip" or "address"'
      });
    }

    const key = type === 'ip' 
      ? `ratelimit:ip:${value}`
      : `ratelimit:address:${value}`;

    await redisService.delete(key);

    logger.info('Rate limit reset', {
      type,
      value,
      admin: req.ip || req.socket.remoteAddress
    });

    return res.json({
      success: true,
      message: `Rate limit reset for ${type}: ${value}`
    });
  } catch (error: any) {
    logger.error('Failed to reset rate limit', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to reset rate limit'
    });
  }
});

/**
 * GET /api/admin/config
 * Get current faucet configuration
 */
router.get('/config', async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        blockchain: {
          chainId: config.blockchain.chainId,
          rpcUrl: config.blockchain.rpcUrl.replace(/:[^:]*@/, ':***@'), // Hide credentials
        },
        faucet: {
          amount: config.faucet.amount,
          cooldownHours: config.faucet.cooldownHours,
          gasLimit: config.faucet.gasLimit,
        },
        rateLimit: config.rateLimit,
        server: {
          port: config.server.port,
          env: config.server.env,
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get config', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve configuration'
    });
  }
});

/**
 * POST /api/admin/manual-send
 * Manually send tokens to an address (emergency use)
 */
router.post('/manual-send', async (req: Request, res: Response) => {
  try {
    const { address, amount } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: address'
      });
    }

    const amountToSend = amount || config.faucet.amount;
    const requestId = `manual_${Date.now()}`;

    logger.warn('Manual token send initiated', {
      address,
      amount: amountToSend,
      admin: req.ip || req.socket.remoteAddress,
      requestId
    });

    const result = await blockchainService.sendTokens(address, requestId);

    logger.info('Manual token send successful', {
      requestId,
      txHash: result.hash,
      address: result.to
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    logger.error('Manual send failed', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/admin/metrics
 * Get Prometheus-compatible metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const stats = await faucetService.getStats();
    const balance = await blockchainService.getBalance();
    const health = await faucetService.healthCheck();

    // Prometheus format
    const metrics = `
# HELP faucet_requests_total Total number of faucet requests
# TYPE faucet_requests_total counter
faucet_requests_total ${stats.totalRequests}

# HELP faucet_requests_successful Successful faucet requests
# TYPE faucet_requests_successful counter
faucet_requests_successful ${stats.successfulRequests}

# HELP faucet_requests_failed Failed faucet requests
# TYPE faucet_requests_failed counter
faucet_requests_failed ${stats.failedRequests}

# HELP faucet_tokens_distributed Total tokens distributed
# TYPE faucet_tokens_distributed counter
faucet_tokens_distributed ${stats.totalTokensDistributed}

# HELP faucet_balance Current faucet balance
# TYPE faucet_balance gauge
faucet_balance ${balance}

# HELP faucet_health Faucet health status (1=healthy, 0=unhealthy)
# TYPE faucet_health gauge
faucet_health ${health.healthy ? 1 : 0}

# HELP faucet_uptime Faucet uptime in seconds
# TYPE faucet_uptime counter
faucet_uptime ${stats.uptime || 0}
    `.trim();

    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    return res.send(metrics);
  } catch (error: any) {
    logger.error('Failed to generate metrics', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to generate metrics'
    });
  }
});

export default router;
