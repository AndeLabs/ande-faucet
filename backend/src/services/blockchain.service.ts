import { ethers, Wallet, JsonRpcProvider, formatEther, parseEther } from 'ethers';
import config from '../config';
import logger, { logTransaction } from '../utils/logger';

/**
 * Blockchain Service
 * Handles all blockchain interactions with ANDE Chain
 */
class BlockchainService {
  private provider: JsonRpcProvider;
  private fallbackProvider?: JsonRpcProvider;
  private wallet: Wallet;
  private isHealthy: boolean = false;
  private lastHealthCheck: Date = new Date();

  constructor() {
    // Initialize provider
    this.provider = new JsonRpcProvider(config.blockchain.rpcUrl);
    
    // Initialize fallback provider if configured
    if (config.blockchain.rpcFallbackUrl) {
      this.fallbackProvider = new JsonRpcProvider(config.blockchain.rpcFallbackUrl);
    }
    
    // Initialize wallet
    if (!config.faucet.privateKey) {
      throw new Error('FAUCET_PRIVATE_KEY is required');
    }
    
    this.wallet = new Wallet(config.faucet.privateKey, this.provider);
    
    logger.info('BlockchainService initialized', {
      rpcUrl: config.blockchain.rpcUrl,
      chainId: config.blockchain.chainId,
      faucetAddress: this.wallet.address,
    });
    
    // Initial health check
    this.healthCheck().catch(err => {
      logger.error('Initial blockchain health check failed', { error: err.message });
    });
  }

  /**
   * Get faucet address
   */
  getFaucetAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get faucet address (alias)
   */
  async getAddress(): Promise<string> {
    return this.wallet.address;
  }

  /**
   * Get faucet balance in ANDE
   */
  async getBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return formatEther(balance);
    } catch (error: any) {
      logger.error('Failed to get faucet balance', { error: error.message });
      
      // Try fallback provider
      if (this.fallbackProvider) {
        try {
          const balance = await this.fallbackProvider.getBalance(this.wallet.address);
          return formatEther(balance);
        } catch (fallbackError: any) {
          logger.error('Fallback provider also failed', { error: fallbackError.message });
        }
      }
      
      throw new Error('Failed to get balance from blockchain');
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      
      // Apply multiplier
      const multipliedPrice = (gasPrice * BigInt(Math.floor(config.faucet.gasPriceMultiplier * 100))) / BigInt(100);
      
      logger.debug('Gas price calculated', {
        baseGasPrice: gasPrice.toString(),
        multipliedGasPrice: multipliedPrice.toString(),
        multiplier: config.faucet.gasPriceMultiplier,
      });
      
      return multipliedPrice;
    } catch (error: any) {
      logger.error('Failed to get gas price', { error: error.message });
      throw error;
    }
  }

  /**
   * Send ANDE tokens to address
   */
  async sendTokens(toAddress: string, requestId: string): Promise<{
    hash: string;
    from: string;
    to: string;
    amount: string;
    gasUsed?: string;
  }> {
    try {
      // Validate address
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Invalid Ethereum address');
      }
      
      // Get checksum address
      const checksumAddress = ethers.getAddress(toAddress);
      
      logger.info('Preparing transaction', {
        requestId,
        to: checksumAddress,
        amount: config.faucet.amount,
      });
      
      // Get current nonce
      const nonce = await this.wallet.getNonce('pending');
      
      // Get gas price
      const gasPrice = await this.getGasPrice();
      
      // Build transaction
      const tx = {
        to: checksumAddress,
        value: parseEther(config.faucet.amount.toString()),
        gasLimit: config.faucet.gasLimit,
        gasPrice: gasPrice,
        nonce: nonce,
        chainId: config.blockchain.chainId,
      };
      
      logger.info('Sending transaction', {
        requestId,
        ...tx,
        value: tx.value.toString(),
        gasPrice: tx.gasPrice.toString(),
      });
      
      // Send transaction
      const txResponse = await this.wallet.sendTransaction(tx);
      
      logTransaction({
        hash: txResponse.hash,
        from: this.wallet.address,
        to: checksumAddress,
        amount: config.faucet.amount.toString(),
        status: 'pending',
      });
      
      logger.info('Transaction sent, waiting for confirmation', {
        requestId,
        hash: txResponse.hash,
      });
      
      // Wait for 1 confirmation
      const receipt = await txResponse.wait(1);
      
      if (!receipt) {
        throw new Error('Transaction receipt is null');
      }
      
      logTransaction({
        hash: txResponse.hash,
        from: this.wallet.address,
        to: checksumAddress,
        amount: config.faucet.amount.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
      });
      
      if (receipt.status !== 1) {
        throw new Error('Transaction failed on chain');
      }
      
      logger.info('Transaction confirmed', {
        requestId,
        hash: txResponse.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
      });
      
      return {
        hash: txResponse.hash,
        from: this.wallet.address,
        to: checksumAddress,
        amount: config.faucet.amount.toString(),
        gasUsed: receipt.gasUsed.toString(),
      };
      
    } catch (error: any) {
      logger.error('Transaction failed', {
        requestId,
        error: error.message,
        stack: error.stack,
      });
      
      logTransaction({
        from: this.wallet.address,
        to: toAddress,
        amount: config.faucet.amount.toString(),
        status: 'failed',
        error: error.message,
      });
      
      throw error;
    }
  }

  /**
   * Check if address has received tokens recently
   */
  async hasRecentTransactions(address: string, windowMs: number = 86400000): Promise<boolean> {
    try {
      // Get recent blocks (last ~24 hours, assuming 12s block time)
      const currentBlock = await this.provider.getBlockNumber();
      const blocksToCheck = Math.floor(windowMs / 12000); // 12s per block
      const fromBlock = Math.max(0, currentBlock - blocksToCheck);
      
      // This is a simplified check - in production, you'd want to use event logs
      // or maintain a database of transactions
      logger.debug('Checking recent transactions', {
        address,
        fromBlock,
        currentBlock,
      });
      
      // For now, we'll rely on our database/cache
      return false;
    } catch (error: any) {
      logger.error('Failed to check recent transactions', {
        address,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check provider connection
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const balance = await this.getBalance();
      
      this.isHealthy = true;
      this.lastHealthCheck = new Date();
      
      logger.info('Blockchain health check passed', {
        chainId: network.chainId.toString(),
        blockNumber,
        faucetBalance: balance,
      });
      
      // Alert if balance is low
      if (parseFloat(balance) < config.alerts.lowBalanceThreshold) {
        logger.warn('Faucet balance is low', {
          currentBalance: balance,
          threshold: config.alerts.lowBalanceThreshold,
        });
        
        // TODO: Send alert notification
      }
      
      return true;
    } catch (error: any) {
      this.isHealthy = false;
      logger.error('Blockchain health check failed', {
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get blockchain info
   */
  async getInfo(): Promise<{
    chainId: number;
    blockNumber: number;
    faucetAddress: string;
    faucetBalance: string;
    isHealthy: boolean;
    lastHealthCheck: Date;
  }> {
    const network = await this.provider.getNetwork();
    const blockNumber = await this.provider.getBlockNumber();
    const balance = await this.getBalance();
    
    return {
      chainId: Number(network.chainId),
      blockNumber,
      faucetAddress: this.wallet.address,
      faucetBalance: balance,
      isHealthy: this.isHealthy,
      lastHealthCheck: this.lastHealthCheck,
    };
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(toAddress: string): Promise<bigint> {
    try {
      const tx = {
        to: toAddress,
        value: parseEther(config.faucet.amount.toString()),
      };
      
      const gasEstimate = await this.provider.estimateGas(tx);
      return gasEstimate;
    } catch (error: any) {
      logger.error('Failed to estimate gas', {
        error: error.message,
        toAddress,
      });
      
      // Return default gas limit
      return BigInt(config.faucet.gasLimit);
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
export default blockchainService;
