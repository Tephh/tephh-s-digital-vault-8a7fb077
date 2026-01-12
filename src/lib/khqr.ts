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
  const result = KHQR.generate({
    tag: TAG.INDIVIDUAL,
    accountID: config.bakongAccount,
    merchantName: config.merchantName,
    merchantCity: config.merchantCity,
    currency: config.currency === 'USD' ? CURRENCY.USD : CURRENCY.KHR,
    amount: config.amount,
    expirationTimestamp: Date.now() + 30 * 60 * 1000, // 30 minutes expiration
    additionalData: {
      billNumber: config.billNumber || `ORD-${Date.now()}`,
      storeLabel: config.storeLabel || "K'TEPHH Shop",
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

// Default merchant config
export const MERCHANT_CONFIG = {
  bakongAccount: 'sin_soktep@bkrt',
  merchantName: "K'TEPHH Kon Khmer Kamjea",
  merchantCity: 'Phnom Penh',
  terminalLabel: '005927335',
};
