import { Platform } from 'react-native';

/**
 * RevenueCat Configuration
 * 
 * API Keys from RevenueCat Dashboard
 */

export const REVENUECAT_CONFIG = {
  // Your RevenueCat API key (same for both platforms in test mode)
  apiKey: 'test_oJYYldTXxyvwFzHGxpwACDlSfvH',
  
  // Log level for debugging (set to false in production)
  debugMode: __DEV__,
};

// Entitlement identifiers (configure these in RevenueCat dashboard)
export const ENTITLEMENTS = {
  PRO: 'PRO',
} as const;

// Product identifiers (configure these in RevenueCat dashboard)
export const PRODUCTS = {
  MONTHLY: 'premium_monthly',
} as const;
