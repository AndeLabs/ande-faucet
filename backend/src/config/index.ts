import dotenv from 'dotenv';
import { parseEther } from 'ethers';

dotenv.config();

/**
 * Application Configuration
 * Centralized configuration with validation and defaults
 */
export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Server
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    env: process.env.NODE_ENV || 'development',
  },
  
  // Admin
  admin: {
    token: process.env.ADMIN_TOKEN || '',
  },
  
  // Blockchain
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    rpcFallbackUrl: process.env.RPC_FALLBACK_URL,
    chainId: parseInt(process.env.CHAIN_ID || '6174', 10),
    chainName: process.env.CHAIN_NAME || 'AndeChain',
  },
  
  // Faucet
  faucet: {
    privateKey: process.env.FAUCET_PRIVATE_KEY,
    amount: parseFloat(process.env.FAUCET_AMOUNT || '10'),
    amountWei: process.env.FAUCET_AMOUNT_WEI || parseEther('10').toString(),
    gasLimit: parseInt(process.env.GAS_LIMIT || '21000', 10),
    gasPriceMultiplier: parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.2'),
    maxPriorityFee: process.env.MAX_PRIORITY_FEE || '2000000000',
    maxFeePerGas: process.env.MAX_FEE_PER_GAS || '20000000000',
  },
  
  // Rate Limiting
  rateLimit: {
    ip: {
      windowMs: parseInt(process.env.RATE_LIMIT_IP_WINDOW_MS || '3600000', 10), // 1 hour
      maxRequests: parseInt(process.env.RATE_LIMIT_IP_MAX_REQUESTS || '5', 10),
    },
    address: {
      windowMs: parseInt(process.env.RATE_LIMIT_ADDRESS_WINDOW_MS || '86400000', 10), // 24 hours
      maxRequests: parseInt(process.env.RATE_LIMIT_ADDRESS_MAX_REQUESTS || '1', 10),
    },
    global: {
      windowMs: parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS || '60000', 10), // 1 minute
      maxRequests: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX_REQUESTS || '100', 10),
    },
    cooldownHours: parseInt(process.env.COOLDOWN_HOURS || '24', 10),
  },
  
  // Captcha
  captcha: {
    enabled: process.env.HCAPTCHA_ENABLED === 'true',
    secret: process.env.HCAPTCHA_SECRET || '',
    siteKey: process.env.HCAPTCHA_SITE_KEY || '',
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    tls: process.env.REDIS_TLS === 'true',
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'ande-faucet:',
  },
  
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ande_faucet',
    ssl: process.env.DATABASE_SSL === 'true',
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
  },
  
  // Queue
  queue: {
    enabled: process.env.QUEUE_ENABLED === 'true',
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || '3', 10),
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '5000', 10),
  },
  
  // Monitoring
  monitoring: {
    prometheusEnabled: process.env.PROMETHEUS_ENABLED === 'true',
    prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
    metricsPath: process.env.METRICS_PATH || '/metrics',
    healthCheckEnabled: process.env.HEALTH_CHECK_ENABLED === 'true',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000', 10),
  },
  
  // Alerts
  alerts: {
    lowBalanceThreshold: parseFloat(process.env.ALERT_LOW_BALANCE_THRESHOLD || '100'),
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
    email: process.env.ALERT_EMAIL,
  },
  
  // Security
  security: {
    helmetEnabled: process.env.HELMET_ENABLED === 'true',
    bodyLimit: process.env.BODY_LIMIT || '10kb',
    adminApiKey: process.env.ADMIN_API_KEY,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/faucet.log',
    maxFiles: process.env.LOG_MAX_FILES || '7',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
  },
  
  // Feature Flags
  features: {
    queueEnabled: process.env.FEATURE_QUEUE_ENABLED === 'true',
    analyticsEnabled: process.env.FEATURE_ANALYTICS_ENABLED === 'true',
    adminPanelEnabled: process.env.FEATURE_ADMIN_PANEL_ENABLED === 'true',
    walletConnect: process.env.FEATURE_WALLET_CONNECT === 'true',
  },
  
  // Performance
  performance: {
    cacheTTL: parseInt(process.env.CACHE_TTL || '300', 10),
    transactionTimeout: parseInt(process.env.TRANSACTION_TIMEOUT || '60000', 10),
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
  },
};

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  const required = [
    'FAUCET_PRIVATE_KEY',
    'RPC_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate private key format
  if (config.faucet.privateKey && !config.faucet.privateKey.startsWith('0x')) {
    throw new Error('FAUCET_PRIVATE_KEY must start with 0x');
  }
  
  // Validate captcha config if enabled
  if (config.captcha.enabled && !config.captcha.secret) {
    throw new Error('HCAPTCHA_SECRET is required when captcha is enabled');
  }
}

export default config;
