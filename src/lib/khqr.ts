import { KHQR, CURRENCY, TAG } from 'ts-khqr';

export interface KHQRConfig {
  bakongAccount: string;
  merchantName: string;
  merchantCity: string;
  currency: 'USD' | 'KHR';
  amount: number;
  billNumber?: string;
  storeLabel?: string;
  terminalLabel?: string;
  mobileNumber?: string;
}

export interface KHQRResult {
  qrString: string;
  md5: string;
}

// Generate KHQR using ts-khqr library
export function generateKHQR(config: KHQRConfig): KHQRResult {
  // Validate amount - must be positive number
  const amount = Number(config.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${config.amount}. Amount must be a positive number.`);
  }

  // Round to 2 decimal places for USD
  const roundedAmount = Math.round(amount * 100) / 100;

  const result = KHQR.generate({
    tag: TAG.INDIVIDUAL,
    accountID: config.bakongAccount,
    merchantName: config.merchantName,
    merchantCity: config.merchantCity,
    currency: config.currency === 'USD' ? CURRENCY.USD : CURRENCY.KHR,
    amount: roundedAmount,
    expirationTimestamp: Date.now() + 30 * 60 * 1000, // 30 minutes expiration
    additionalData: {
      billNumber: config.billNumber || `ORD-${Date.now()}`,
      storeLabel: config.storeLabel || 'Tephh Shop',
      terminalLabel: config.terminalLabel || '005927335',
      mobileNumber: config.mobileNumber,
    },
  });

  if (result.status.code !== 0) {
    console.error('KHQR generation error:', result.status);
    throw new Error(result.status.message || 'Failed to generate KHQR');
  }

  return {
    qrString: result.data.qr,
    md5: result.data.md5,
  };
}

export function verifyKHQR(qrString: string): boolean {
  const result = KHQR.verify(qrString);
  return result.isValid;
}

// Default merchant config - Updated with real merchant info
export const MERCHANT_CONFIG = {
  bakongAccount: 'sin_soktep@bkrt',
  merchantName: 'Tephh So Tuf',
  merchantCity: 'Phnom Penh',
  terminalLabel: '005927335',
};
