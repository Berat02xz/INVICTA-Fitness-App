import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOffering,
  PurchasesPackage,
  PurchasesStoreTransaction,
} from 'react-native-purchases';
import { REVENUECAT_CONFIG, ENTITLEMENTS } from '@/constants/revenueCat';
import database from '@/database/database';
import { User } from '@/models/User';

/**
 * RevenueCat Service
 * Handles all RevenueCat operations for subscription management
 */

class RevenueCatService {
  private static instance: RevenueCatService;
  private isConfigured = false;

  private constructor() {}

  static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  /**
   * Initialize RevenueCat SDK
   * Call this once when the app starts
   */
  async initialize(): Promise<void> {
    if (this.isConfigured) {
      console.log('📱 RevenueCat already configured');
      return;
    }

    try {
      console.log('📱 Initializing RevenueCat...');
      
      // Set log level
      if (REVENUECAT_CONFIG.debugMode) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Configure SDK with the API key
      Purchases.configure({
        apiKey: REVENUECAT_CONFIG.apiKey,
      });

      this.isConfigured = true;
      console.log('✅ RevenueCat initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Identify user after registration/login
   * @param userId - Unique user identifier
   */
  async identifyUser(userId: string, userAttributes?: {
    name?: string;
    email?: string;
  }): Promise<CustomerInfo> {
    try {
      console.log('👤 Identifying user with RevenueCat:', userId);
      
      const { customerInfo } = await Purchases.logIn(userId);
      
      // Set user attributes if provided (do them sequentially to avoid race conditions)
      if (userAttributes) {
        try {
          // Use setAttributes instead of individual setters to avoid multiple API calls
          const attributes: { [key: string]: string | null } = {};
          
          if (userAttributes.email) {
            attributes['$email'] = userAttributes.email;
          }
          if (userAttributes.name) {
            attributes['$displayName'] = userAttributes.name;
          }
          
          if (Object.keys(attributes).length > 0) {
            await Purchases.setAttributes(attributes);
          }
        } catch (attrError) {
          console.warn('⚠️ Failed to set user attributes (non-critical):', attrError);
          // Don't throw - attributes are nice to have but not critical
        }
      }
      
      console.log('✅ User identified successfully');
      console.log('📊 Customer Info:', {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: customerInfo.activeSubscriptions,
        allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers,
        entitlements: Object.keys(customerInfo.entitlements.active),
      });
      
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to identify user:', error);
      throw error;
    }
  }

  /**
   * Check if user has active PRO subscription
   * Checks BOTH RevenueCat entitlement AND WatermelonDB Role field
   * User has PRO if EITHER source says so
   */
  async isProActive(): Promise<boolean> {
    try {
      // Check RevenueCat subscription
      let hasRevenueCatPro = false;
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        hasRevenueCatPro = customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;
        console.log('🔍 RevenueCat PRO status:', hasRevenueCatPro);
      } catch (revenueCatError) {
        console.warn('⚠️ Failed to check RevenueCat PRO status:', revenueCatError);
      }
      
      // Check WatermelonDB Role field
      let hasWatermelonPro = false;
      try {
        const user = await User.getUserDetails(database);
        if (user && user.role) {
          hasWatermelonPro = user.role.toUpperCase() === 'PRO' || user.role.toUpperCase() === 'PREMIUM';
          console.log('🔍 WatermelonDB Role:', user.role, '- Has PRO:', hasWatermelonPro);
        }
      } catch (dbError) {
        console.warn('⚠️ Failed to check WatermelonDB Role:', dbError);
      }
      
      // User has PRO if EITHER RevenueCat OR WatermelonDB says so
      const isPro = hasRevenueCatPro || hasWatermelonPro;
      console.log('✅ Final PRO status:', isPro, '(RevenueCat:', hasRevenueCatPro, ', WatermelonDB:', hasWatermelonPro, ')');
      
      return isPro;
    } catch (error) {
      console.error('❌ Failed to check PRO status:', error);
      return false;
    }
  }

  /**
   * Get current customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to get customer info:', error);
      throw error;
    }
  }

  /**
   * Get available offerings (subscription packages)
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      console.log('📦 Fetching offerings...');
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current !== null) {
        console.log('✅ Current offering:', offerings.current.identifier);
        console.log('📦 Available packages:', offerings.current.availablePackages.length);
        
        // Log package details
        offerings.current.availablePackages.forEach(pkg => {
          console.log(`  - ${pkg.identifier}: ${pkg.product.priceString}`);
        });
      } else {
        console.warn('⚠️ No current offering found');
      }
      
      return offerings.current;
    } catch (error) {
      console.error('❌ Failed to get offerings:', error);
      return null;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<{
    customerInfo: CustomerInfo;
    transaction?: PurchasesStoreTransaction;
  }> {
    try {
      console.log('💳 Purchasing package:', pkg.identifier);
      
      const purchaseResult = await Purchases.purchasePackage(pkg);
      
      console.log('✅ Purchase successful');
      console.log('📊 Active entitlements:', Object.keys(purchaseResult.customerInfo.entitlements.active));
      
      return purchaseResult;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('ℹ️ Purchase cancelled by user');
      } else {
        console.error('❌ Purchase failed:', error);
      }
      throw error;
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      console.log('🔄 Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      console.log('✅ Purchases restored');
      console.log('📊 Active entitlements:', Object.keys(customerInfo.entitlements.active));
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Log out user (for when user logs out of your app)
   */
  async logout(): Promise<CustomerInfo> {
    try {
      console.log('👋 Logging out from RevenueCat...');
      const customerInfo = await Purchases.logOut();
      console.log('✅ Logged out successfully');
      return customerInfo;
    } catch (error) {
      console.error('❌ Failed to logout:', error);
      throw error;
    }
  }

  /**
   * Set user attributes for tracking and targeting
   */
  async setUserAttributes(attributes: { [key: string]: string | null }): Promise<void> {
    try {
      await Purchases.setAttributes(attributes);
      console.log('✅ User attributes set:', Object.keys(attributes));
    } catch (error) {
      console.error('❌ Failed to set user attributes:', error);
    }
  }

  /**
   * Update user email and name attributes
   * Convenience method for updating common user attributes
   */
  async updateUserProfile(email?: string, name?: string): Promise<void> {
    try {
      const attributes: { [key: string]: string | null } = {};
      
      if (email) {
        attributes['$email'] = email;
      }
      if (name) {
        attributes['$displayName'] = name;
      }
      
      if (Object.keys(attributes).length > 0) {
        await this.setUserAttributes(attributes);
        console.log('✅ User profile attributes updated');
      }
    } catch (error) {
      console.error('❌ Failed to update user profile attributes:', error);
    }
  }

  /**
   * Check if SDK is configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Get app user ID
   */
  async getAppUserId(): Promise<string> {
    try {
      const appUserId = await Purchases.getAppUserID();
      return appUserId;
    } catch (error) {
      console.error('❌ Failed to get app user ID:', error);
      throw error;
    }
  }

  /**
   * Check if user is anonymous
   */
  async isAnonymous(): Promise<boolean> {
    try {
      const isAnonymous = await Purchases.isAnonymous();
      return isAnonymous;
    } catch (error) {
      console.error('❌ Failed to check anonymous status:', error);
      return true;
    }
  }
}

// Export singleton instance
export default RevenueCatService.getInstance();
