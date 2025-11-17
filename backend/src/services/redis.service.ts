import Redis from 'ioredis';
import config from '../config';
import logger from '../utils/logger';

/**
 * Redis Service
 * Handles caching and rate limiting
 */
class RedisService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis(config.redis.url, {
      password: config.redis.password,
      db: config.redis.db,
      keyPrefix: config.redis.keyPrefix,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      logger.error('Redis error', { error: err.message });
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis connection closed');
    });
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error: any) {
      logger.error('Redis GET failed', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error: any) {
      logger.error('Redis SET failed', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      logger.error('Redis DEL failed', { key, error: error.message });
      return false;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error: any) {
      logger.error('Redis INCR failed', { key, error: error.message });
      return 0;
    }
  }

  /**
   * Set with expiry
   */
  async setex(key: string, seconds: number, value: string): Promise<boolean> {
    try {
      await this.client.setex(key, seconds, value);
      return true;
    } catch (error: any) {
      logger.error('Redis SETEX failed', { key, error: error.message });
      return false;
    }
  }

  /**
   * Get TTL of key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error: any) {
      logger.error('Redis TTL failed', { key, error: error.message });
      return -1;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error('Redis EXISTS failed', { key, error: error.message });
      return false;
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(...keys);
    } catch (error: any) {
      logger.error('Redis MGET failed', { keys, error: error.message });
      return [];
    }
  }

  /**
   * Rate limiting check
   */
  async checkRateLimit(key: string, limit: number, windowMs: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    try {
      const windowSeconds = Math.floor(windowMs / 1000);
      const current = await this.client.get(key);
      
      if (!current) {
        // First request in window
        await this.client.setex(key, windowSeconds, '1');
        
        return {
          allowed: true,
          remaining: limit - 1,
          resetAt: new Date(Date.now() + windowMs),
        };
      }
      
      const count = parseInt(current, 10);
      
      if (count >= limit) {
        // Rate limit exceeded
        const ttl = await this.client.ttl(key);
        
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(Date.now() + (ttl * 1000)),
        };
      }
      
      // Increment counter
      await this.client.incr(key);
      
      return {
        allowed: true,
        remaining: limit - count - 1,
        resetAt: new Date(Date.now() + windowMs),
      };
      
    } catch (error: any) {
      logger.error('Rate limit check failed', { key, error: error.message });
      
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: limit,
        resetAt: new Date(Date.now() + windowMs),
      };
    }
  }

  /**
   * Get connection status
   */
  isHealthy(): boolean {
    return this.isConnected;
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    await this.client.quit();
  }

  /**
   * Flush all data (use with caution!)
   */
  async flushAll(): Promise<void> {
    if (config.isDevelopment) {
      await this.client.flushdb();
      logger.warn('Redis database flushed (development mode)');
    }
  }

  /**
   * Ping Redis
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error: any) {
      logger.error('Redis PING failed', { error: error.message });
      return false;
    }
  }

  /**
   * Delete key (alias for del)
   */
  async delete(key: string): Promise<boolean> {
    return this.del(key);
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error: any) {
      logger.error('Redis KEYS failed', { pattern, error: error.message });
      return [];
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();
export default redisService;
