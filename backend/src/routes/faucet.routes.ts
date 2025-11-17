import { Router, Request, Response } from 'express';
import { FaucetService } from '../services/faucet.service';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { logger } from '../utils/logger';
import { isAddress } from 'ethers';

const router = Router();
const faucetService = new FaucetService();

/**
 * POST /api/faucet/request
 * Request tokens from the faucet
 */
router.post('/request', rateLimitMiddleware, async (req: Request, res: Response) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const { address, captchaToken } = req.body;

    // Validate request body
    if (!address || !captchaToken) {
      logger.warn('Missing required fields', { requestId, address, hasCaptcha: !!captchaToken });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: address and captchaToken'
      });
    }

    // Validate Ethereum address
    if (!isAddress(address)) {
      logger.warn('Invalid Ethereum address', { requestId, address });
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    logger.info('Processing faucet request', {
      requestId,
      address,
      ipAddress
    });

    const result = await faucetService.processRequest({
      address,
      captchaToken,
      ipAddress,
      requestId
    });

    logger.info('Faucet request successful', {
      requestId,
      txHash: result.txHash,
      address: result.address
    });

    return res.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    logger.error('Faucet request failed', {
      requestId,
      error: error.message,
      stack: error.stack
    });

    // Handle specific errors
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('captcha')) {
      return res.status(400).json({
        success: false,
        error: 'Captcha verification failed'
      });
    }

    if (error.message.includes('balance')) {
      return res.status(503).json({
        success: false,
        error: 'Faucet temporarily unavailable. Please try again later.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/faucet/info
 * Get faucet information
 */
router.get('/info', async (req: Request, res: Response) => {
  try {
    const info = await faucetService.getFaucetInfo();
    
    return res.json({
      success: true,
      data: info
    });
  } catch (error: any) {
    logger.error('Failed to get faucet info', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve faucet information'
    });
  }
});

/**
 * GET /api/faucet/stats
 * Get faucet statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await faucetService.getStats();
    
    return res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logger.error('Failed to get faucet stats', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve faucet statistics'
    });
  }
});

/**
 * GET /api/faucet/cooldown/:address
 * Check cooldown status for an address
 */
router.get('/cooldown/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!isAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    const cooldown = await faucetService.checkCooldown(address);
    
    return res.json({
      success: true,
      data: cooldown
    });
  } catch (error: any) {
    logger.error('Failed to check cooldown', {
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to check cooldown status'
    });
  }
});

/**
 * GET /api/faucet/health
 * Health check endpoint
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await faucetService.healthCheck();
    
    const status = health.healthy ? 200 : 503;
    
    return res.status(status).json({
      success: health.healthy,
      data: health
    });
  } catch (error: any) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack
    });

    return res.status(503).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router;
