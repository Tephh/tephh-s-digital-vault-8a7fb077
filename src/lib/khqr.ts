import MD5 from 'crypto-js/md5';

export interface KHQRConfig {
  bakongAccount: string;
  merchantName: string;
  merchantCity: string;
  currency: 'USD' | 'KHR';
  amount: number;
  billNumber?: string;
  storeLabel?: string;
  terminalLabel?: string;
}

export interface KHQRResult {
  qrString: string;
  md5: string;
}

// Generate KHQR string manually following EMV QR Code specification
export function generateKHQR(config: KHQRConfig): KHQRResult {
  const currencyCode = config.currency === 'USD' ? '840' : '116';
  const amountStr = config.amount.toFixed(2);
  
  // Build EMV QR code data
  let qrData = '';
  
  // Payload Format Indicator
  qrData += '000201';
  
  // Point of Initiation Method (dynamic)
  qrData += '010212';
  
  // Merchant Account Information (Bakong)
  const bakongTag = '29';
  let merchantInfo = '';
  merchantInfo += '0006BAKONG';
  merchantInfo += `01${config.bakongAccount.length.toString().padStart(2, '0')}${config.bakongAccount}`;
  qrData += `${bakongTag}${merchantInfo.length.toString().padStart(2, '0')}${merchantInfo}`;
  
  // Merchant Category Code
  qrData += '52045999';
  
  // Transaction Currency
  qrData += `5303${currencyCode}`;
  
  // Transaction Amount
  qrData += `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`;
  
  // Country Code
  qrData += '5802KH';
  
  // Merchant Name
  const name = config.merchantName.substring(0, 25);
  qrData += `59${name.length.toString().padStart(2, '0')}${name}`;
  
  // Merchant City
  const city = config.merchantCity.substring(0, 15);
  qrData += `60${city.length.toString().padStart(2, '0')}${city}`;
  
  // Additional Data
  if (config.billNumber || config.terminalLabel) {
    let additionalData = '';
    if (config.billNumber) {
      additionalData += `01${config.billNumber.length.toString().padStart(2, '0')}${config.billNumber}`;
    }
    if (config.terminalLabel) {
      additionalData += `07${config.terminalLabel.length.toString().padStart(2, '0')}${config.terminalLabel}`;
    }
    qrData += `62${additionalData.length.toString().padStart(2, '0')}${additionalData}`;
  }
  
  // CRC placeholder
  qrData += '6304';
  
  // Calculate CRC16
  const crc = calculateCRC16(qrData);
  const qrString = qrData + crc;
  
  const md5Hash = MD5(qrString).toString();

  return {
    qrString,
    md5: md5Hash,
  };
}

function calculateCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function verifyPaymentMD5(qrString: string, expectedMD5: string): boolean {
  const calculatedMD5 = MD5(qrString).toString();
  return calculatedMD5.toLowerCase() === expectedMD5.toLowerCase();
}

// Default merchant config
export const MERCHANT_CONFIG = {
  bakongAccount: 'sin_soktep@bkrt',
  merchantName: "K'TEPHH Kon Khmer Kamjea",
  merchantCity: 'Phnom Penh',
};
