// Simple device fingerprinting for coupon restrictions
export const generateDeviceFingerprint = (): string => {
  const components: string[] = [];
  
  // Screen info
  components.push(`${screen.width}x${screen.height}`);
  components.push(`${screen.colorDepth}`);
  
  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Language
  components.push(navigator.language);
  
  // Platform
  components.push(navigator.platform);
  
  // User agent hash
  const userAgent = navigator.userAgent;
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  components.push(hash.toString(36));
  
  // Canvas fingerprint (simplified)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      const canvasHash = canvas.toDataURL().slice(-50);
      components.push(canvasHash);
    }
  } catch {
    components.push('no-canvas');
  }
  
  // Combine and hash
  const combined = components.join('|');
  let fingerprint = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    fingerprint = ((fingerprint << 5) - fingerprint) + char;
    fingerprint = fingerprint & fingerprint;
  }
  
  return Math.abs(fingerprint).toString(36);
};

// Get or create stored fingerprint
export const getDeviceFingerprint = (): string => {
  const storageKey = 'device_fp';
  let fp = localStorage.getItem(storageKey);
  
  if (!fp) {
    fp = generateDeviceFingerprint();
    localStorage.setItem(storageKey, fp);
  }
  
  return fp;
};