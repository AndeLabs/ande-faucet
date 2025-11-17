import { v4 as uuidv4 } from 'uuid';
import blockchainService from './blockchain.service';
import redisService from './redis.service';
import captchaService from './captcha.service';
import config from '../config';
import logger, { logFaucetRequest } from '../utils/logger';

export interface FaucetRequest {
  address: string;
  captchaToken: string;
  ipAddress: string;
  requestId: string;
}

export interface FaucetResponse {
  txHash: string;
  address: string;
  amount: string;
  timestamp: string;
}

export interface FaucetStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalDistributed: string;
  faucetBalance: string;
  lastRequest?: Date;
}

/**
 * Faucet Service
 * Main service that coordinates token distribution
 */
class FaucetService {
  private readonly CACHE_KEY_PREFIX = 'faucet:';
  private readonly IP_KEY_PREFIX = 'ip:';
  private readonly ADDRESS_KEY_PREFIX = 'address:';
  private readonly STATS_KEY = 'stats';

  /**
   * Process faucet request
   */
  async processRequest(request: FaucetRequest): Promise<FaucetResponse> {
    const startTime = Date.now();

    try {
      logger.info('Processing faucet request', {
        requestId: request.requestId,
        address: request.address,
        ip: request.ipAddress,
      });

      // Step 1: Validate address format
      if (!this.isValidAddress(request.address)) {
        throw new Error('Invalid Ethereum address format');
      }

      // Step 2: Verify captcha
      const captchaResult = await captchaService.verify(request.captchaToken, request.ipAddress);
      
      if (!captchaResult.success) {
        throw new Error('Captcha verification failed');
      }

      // Step 3: Check IP rate limit
      const ipRateLimit = await this.checkIPRateLimit(request.ipAddress);
      if (!ipRateLimit.allowed) {
        throw new Error(`IP rate limit exceeded. Try again in ${Math.ceil((ipRateLimit.resetAt.getTime() - Date.now()) / 60000)} minutes`);
      }

      // Step 4: Check address rate limit
      const addressRateLimit = await this.checkAddressRateLimit(request.address);
      if (!addressRateLimit.allowed) {
        const hoursRemaining = Math.ceil((addressRateLimit.resetAt.getTime() - Date.now()) / 3600000);
        throw new Error(`Address rate limit exceeded. Try again in ${hoursRemaining} hours`);
      }

      // Step 5: Check faucet balance
      const balance = parseFloat(await blockchainService.getBalance());
      if (balance < config.faucet.amount * 2) {
        logger.error('Faucet balance too low', {
          balance,
          required: config.faucet.amount,
        });
        throw new Error('Faucet balance too low. Please contact support.');
      }

      // Step 6: Send tokens
      const txResult = await blockchainService.sendTokens(request.address, request.requestId);

      // Step 7: Update stats
      await this.updateStats(request.address, txResult.hash);

      // Step 8: Log success
      const duration = Date.now() - startTime;
      logger.info('Faucet request completed successfully', {
        requestId: request.requestId,
        address: request.address,
        transactionHash: txResult.hash,
        duration: `${duration}ms`,
      });

      return {
        txHash: txResult.hash,
        address: txResult.to,
        amount: txResult.amount,
        timestamp: new Date().toISOString(),
      };

    } catch (error: any) {
      logger.error('Faucet request failed', {
        requestId: request.requestId,
        address: request.address,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  /**
   * Check if address is eligible for tokens
   */
  async checkEligibility(address: string): Promise<{
    eligible: boolean;
    reason?: string;
    nextEligibleAt?: Date;
  }> {
    // Validate address
    if (!this.isValidAddress(address)) {
      return {
        eligible: false,
        reason: 'Invalid address format',
      };
    }

    // Check rate limit
    const rateLimit = await this.checkAddressRateLimit(address);
    
    if (!rateLimit.allowed) {
      return {
        eligible: false,
        reason: `Address has received tokens recently. Please wait ${config.rateLimit.cooldownHours} hours.`,
        nextEligibleAt: rateLimit.resetAt,
      };
    }

    return {
      eligible: true,
    };
  }

  /**
   * Get faucet statistics
   */
  async getStats(): Promise<FaucetStats> {
    try {
      const statsData = await redisService.get(this.STATS_KEY);
      const balance = await blockchainService.getBalance();
      
      if (statsData) {
        const stats = JSON.parse(statsData);
        return {
          ...stats,
          faucetBalance: balance,
        };
      }

      // Default stats
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalDistributed: '0',
        faucetBalance: balance,
      };
    } catch (error: any) {
      logger.error('Failed to get stats', { error: error.message });
      
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalDistributed: '0',
        faucetBalance: '0',
      };
    }
  }

  /**
   * Get faucet info
   */
  async getFaucetInfo(): Promise<{
    chainId: number;
    faucetAddress: string;
    faucetBalance: string;
    amount: string;
    cooldownHours: number;
  }> {
    const balance = await blockchainService.getBalance();
    const address = await blockchainService.getAddress();
    
    return {
      chainId: config.blockchain.chainId,
      faucetAddress: address,
      faucetBalance: balance,
      amount: config.faucet.amount.toString(),
      cooldownHours: config.faucet.cooldownHours,
    };
  }

  /**
   * Check cooldown status for an address
   */
  async checkCooldown(address: string): Promise<{
    canRequest: boolean;
    cooldownEndsAt?: Date;
    remainingTime?: number;
  }> {
    const key = `${this.ADDRESS_KEY_PREFIX}${address.toLowerCase()}`;
    const rateLimit = await redisService.checkRateLimit(
      key,
      config.rateLimit.address.maxRequests,
      config.rateLimit.address.windowMs
    );

    if (rateLimit.allowed) {
      return {
        canRequest: true,
      };
    }

    const remainingMs = rateLimit.resetAt.getTime() - Date.now();
    
    return {
      canRequest: false,
      cooldownEndsAt: rateLimit.resetAt,
      remainingTime: remainingMs,
    };
  }

  /**
   * Get recent faucet requests
   */
  async getRecentRequests(limit: number = 50): Promise<any[]> {
    try {
      // This is a simple implementation - in production you'd want a proper database
      const keys = await redisService.keys('request:*');
      const recentKeys = keys.slice(0, limit);
      
      const requests = await Promise.all(
        recentKeys.map(async (key) => {
          const data = await redisService.get(key);
          return data ? JSON.parse(data) : null;
        })
      );

      return requests.filter(r => r !== null);
    } catch (error: any) {
      logger.error('Failed to get recent requests', { error: error.message });
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    blockchain: boolean;
    redis: boolean;
    captcha: boolean;
  }> {
    try {
      const blockchainHealthy = await blockchainService.healthCheck();
      const redisHealthy = await redisService.ping();
      const captchaHealthy = captchaService.isEnabled();

      return {
        healthy: blockchainHealthy && redisHealthy,
        blockchain: blockchainHealthy,
        redis: redisHealthy,
        captcha: captchaHealthy,
      };
    } catch (error: any) {
      logger.error('Health check failed', { error: error.message });
      return {
        healthy: false,
        blockchain: false,
        redis: false,
        captcha: false,
      };
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private async checkIPRateLimit(ip: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const key = `${this.IP_KEY_PREFIX}${ip}`;
    return await redisService.checkRateLimit(
      key,
      config.rateLimit.ip.maxRequests,
      config.rateLimit.ip.windowMs
    );
  }

  private async checkAddressRateLimit(address: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const key = `${this.ADDRESS_KEY_PREFIX}${address.toLowerCase()}`;
    return await redisService.checkRateLimit(
      key,
      config.rateLimit.address.maxRequests,
      config.rateLimit.address.windowMs
    );
  }

  private async updateStats(address: string, txHash: string): Promise<void> {
    try {
      const statsData = await redisService.get(this.STATS_KEY);
      const stats = statsData ? JSON.parse(statsData) : {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalDistributed: '0',
      };

      stats.totalRequests += 1;
      stats.successfulRequests += 1;
      stats.totalDistributed = (
        parseFloat(stats.totalDistributed) + config.faucet.amount
      ).toString();
      stats.lastRequest = new Date();

      await redisService.set(this.STATS_KEY, JSON.stringify(stats));
      
      // Also store individual request
      const requestKey = `request:${txHash}`;
      await redisService.setex(
        requestKey,
        86400 * 7, // Keep for 7 days
        JSON.stringify({
          address,
          txHash,
          amount: config.faucet.amount,
          timestamp: new Date(),
        })
      );
    } catch (error: any) {
      logger.error('Failed to update stats', { error: error.message });
    }
  }

  private createErrorResponse(message: string, requestId: string): FaucetResponse {
    return {
      success: false,
      message,
      requestId,
    };
  }
}

// Export singleton instance
export const faucetService = new FaucetService();
export default faucetService;
