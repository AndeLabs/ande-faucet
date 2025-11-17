import axios from 'axios';
import config from '../config';
import logger from '../utils/logger';

/**
 * Cloudflare Turnstile Captcha Service
 * https://developers.cloudflare.com/turnstile/
 */
class CaptchaService {
  private readonly VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  private readonly secretKey: string;
  private readonly enabled: boolean;

  constructor() {
    this.secretKey = process.env.TURNSTILE_SECRET_KEY || config.captcha.secret;
    this.enabled = config.captcha.enabled;

    if (this.enabled && !this.secretKey) {
      logger.warn('Captcha is enabled but TURNSTILE_SECRET_KEY is not set');
    }

    logger.info('CaptchaService initialized', {
      enabled: this.enabled,
      provider: 'Cloudflare Turnstile',
    });
  }

  /**
   * Verify Cloudflare Turnstile token
   */
  async verify(token: string, ip?: string): Promise<{
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    errorCodes?: string[];
    action?: string;
    cdata?: string;
  }> {
    if (!this.enabled) {
      logger.debug('Captcha verification skipped (disabled)');
      return { success: true };
    }

    if (!token) {
      logger.warn('Captcha verification failed: No token provided');
      return {
        success: false,
        errorCodes: ['missing-input-response'],
      };
    }

    try {
      logger.debug('Verifying Turnstile token', {
        tokenLength: token.length,
        ip,
      });

      const formData = new URLSearchParams();
      formData.append('secret', this.secretKey);
      formData.append('response', token);
      
      if (ip) {
        formData.append('remoteip', ip);
      }

      const response = await axios.post(this.VERIFY_URL, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      });

      const result = response.data;

      if (result.success) {
        logger.info('Captcha verification successful', {
          hostname: result.hostname,
          challenge_ts: result['challenge_ts'],
          action: result.action,
        });
      } else {
        logger.warn('Captcha verification failed', {
          errorCodes: result['error-codes'],
        });
      }

      return {
        success: result.success,
        challenge_ts: result['challenge_ts'],
        hostname: result.hostname,
        errorCodes: result['error-codes'],
        action: result.action,
        cdata: result.cdata,
      };

    } catch (error: any) {
      logger.error('Captcha verification error', {
        error: error.message,
        response: error.response?.data,
      });

      return {
        success: false,
        errorCodes: ['verification-error'],
      };
    }
  }

  /**
   * Check if captcha is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get site key for frontend
   */
  getSiteKey(): string {
    return process.env.TURNSTILE_SITE_KEY || config.captcha.siteKey;
  }
}

// Export singleton instance
export const captchaService = new CaptchaService();
export default captchaService;
