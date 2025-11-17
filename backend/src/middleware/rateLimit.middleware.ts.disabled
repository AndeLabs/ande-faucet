import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisService from '../services/redis.service';
import config from '../config';
import logger from '../utils/logger';

/**
 * Global rate limiter
 * Protects against DDoS and abuse
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.rateLimit.global.windowMs,
  max: config.rateLimit.global.maxRequests,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Global rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

/**
 * API rate limiter for faucet requests
 * Stricter limits for actual token requests
 */
export const faucetRateLimiter = rateLimit({
  windowMs: config.rateLimit.ip.windowMs,
  max: config.rateLimit.ip.maxRequests,
  message: {
    success: false,
    message: 'Too many faucet requests from this IP.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limit for admin with valid API key
    const apiKey = req.headers['x-api-key'];
    return apiKey === config.security.adminApiKey;
  },
  handler: (req, res) => {
    logger.warn('Faucet rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    
    res.status(429).json({
      success: false,
      message: `Too many requests from your IP. Maximum ${config.rateLimit.ip.maxRequests} requests per hour.`,
      retryAfter: Math.ceil(config.rateLimit.ip.windowMs / 1000 / 60),
    });
  },
});

/**
 * Lenient rate limiter for info endpoints
 */
export const infoRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
