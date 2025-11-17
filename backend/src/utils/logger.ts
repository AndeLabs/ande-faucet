import winston from 'winston';
import config from '../config';

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

/**
 * Custom log format for development
 */
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.isDevelopment && config.logging.format !== 'json' 
      ? combine(colorize(), devFormat)
      : json()
  ),
  defaultMeta: { service: 'ande-faucet' },
  transports: [
    // Console transport
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

// File transport for production
if (config.logging.fileEnabled) {
  logger.add(new winston.transports.File({
    filename: config.logging.filePath.replace('.log', '-error.log'),
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  }));
  
  logger.add(new winston.transports.File({
    filename: config.logging.filePath,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: parseInt(config.logging.maxFiles),
  }));
}

/**
 * Log request details
 */
export const logRequest = (req: any, res: any, duration: number) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

/**
 * Log transaction details
 */
export const logTransaction = (data: {
  hash?: string;
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}) => {
  const level = data.status === 'failed' ? 'error' : 'info';
  logger[level]('Transaction', data);
};

/**
 * Log faucet request
 */
export const logFaucetRequest = (data: {
  address: string;
  ip: string;
  captchaVerified: boolean;
  rateLimited: boolean;
  success: boolean;
  reason?: string;
}) => {
  logger.info('Faucet Request', data);
};

export default logger;
