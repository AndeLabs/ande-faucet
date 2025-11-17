import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config';
import { logger } from './utils/logger';
import faucetRoutes from './routes/faucet.routes';
import adminRoutes from './routes/admin.routes';

// Initialize Express app
const app = express();

// Trust proxy - important for rate limiting and getting real IP
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
});

// Health check endpoint (no auth required)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/faucet', faucetRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'ANDE Faucet API',
    version: '1.0.0',
    endpoints: {
      faucet: '/api/faucet',
      admin: '/api/admin',
      health: '/health',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown`);
  
  try {
    // Close server
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Give ongoing requests time to complete
    setTimeout(() => {
      logger.info('Forcing shutdown');
      process.exit(0);
    }, 10000);

  } catch (error: any) {
    logger.error('Error during shutdown', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Start server
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  logger.info('ANDE Faucet Server started', {
    port: PORT,
    env: config.server.env,
    nodeVersion: process.version,
  });
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
});

export default app;
