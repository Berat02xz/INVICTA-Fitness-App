/**
 * RevenueCat Integration Guide for Invicta Fitness App
 * 
 * This file demonstrates how to use RevenueCat features in your app.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Paywall from '@/components/ui/RevenueCat/Paywall';
import CustomerCenter from '@/components/ui/RevenueCat/CustomerCenter';
import { useProStatus } from '@/hooks/useProStatus';
import RevenueCatService from '@/api/RevenueCatService';
import { theme } from '@/constants/theme';

/**
 * Example: Using Paywall and Customer Center in your Profile Screen
 */
export const ProfileScreenExample = () => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);
  const { isPro, loading, refresh } = useProStatus();

  const handleUpgradeToPro = () => {
    setShowPaywall(true);
  };

  const handleManageSubscription = () => {
    setShowCustomerCenter(true);
  };

  const handlePurchaseCompleted = async () => {
    // Refresh PRO status after purchase
    await refresh();
    
    // You can also update your backend here if needed
    console.log('✅ User is now PRO!');
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.text}>Checking subscription status...</Text>
      ) : (
        <>
          {/* Show PRO Badge */}
          {isPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>⭐ PRO</Text>
            </View>
          )}

          {/* Subscription Button */}
          {!isPro ? (
            <TouchableOpacity 
              style={styles.button}
              onPress={handleUpgradeToPro}
            >
              <Text style={styles.buttonText}>🚀 Upgrade to PRO</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.button}
              onPress={handleManageSubscription}
            >
              <Text style={styles.buttonText}>⚙️ Manage Subscription</Text>
            </TouchableOpacity>
          )}

          {/* Restore Purchases Button */}
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={async () => {
              try {
                await RevenueCatService.restorePurchases();
                await refresh();
              } catch (error) {
                console.error('Restore failed:', error);
              }
            }}
          >
            <Text style={styles.buttonText}>🔄 Restore Purchases</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Paywall Modal */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseCompleted={handlePurchaseCompleted}
      />

      {/* Customer Center Modal */}
      <CustomerCenter
        visible={showCustomerCenter}
        onClose={() => setShowCustomerCenter(false)}
      />
    </View>
  );
};

/**
 * Example: Checking PRO Status Before Showing Premium Features
 */
export const ConditionalFeatureExample = () => {
  const { isPro } = useProStatus();

  if (!isPro) {
    return (
      <View style={styles.lockedFeature}>
        <Text style={styles.lockedText}>🔒 PRO Feature</Text>
        <Text style={styles.lockedSubtext}>
          Upgrade to PRO to unlock this feature
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.text}>✅ Premium Feature Content Here</Text>
    </View>
  );
};

/**
 * Example: Manually Checking PRO Status
 */
export const ManualCheckExample = async () => {
  const isPro = await RevenueCatService.isProActive();
  
  if (isPro) {
    console.log('User has PRO access');
    // Show premium features
  } else {
    console.log('User is on free plan');
    // Show paywall or limited features
  }
};

/**
 * Example: Getting Customer Info
 */
export const GetCustomerInfoExample = async () => {
  try {
    const customerInfo = await RevenueCatService.getCustomerInfo();
    
    console.log('Original App User ID:', customerInfo.originalAppUserId);
    console.log('Active Subscriptions:', customerInfo.activeSubscriptions);
    console.log('All Purchased Products:', customerInfo.allPurchasedProductIdentifiers);
    console.log('Entitlements:', customerInfo.entitlements.active);
    
    // Check specific entitlement
    const hasProAccess = customerInfo.entitlements.active['PRO'] !== undefined;
    console.log('Has PRO Access:', hasProAccess);
    
  } catch (error) {
    console.error('Failed to get customer info:', error);
  }
};

/**
 * Example: Setting User Attributes (for analytics and targeting)
 */
export const SetUserAttributesExample = async (userData: any) => {
  await RevenueCatService.setUserAttributes({
    'fitness_goal': userData.goal,
    'activity_level': userData.activityLevel,
    'age_group': userData.age < 25 ? 'young' : userData.age < 40 ? 'mid' : 'senior',
  });
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  text: {
    color: theme.textColor,
    fontSize: 16,
    fontFamily: 'Regular',
  },
  proBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  proBadgeText: {
    color: '#000',
    fontFamily: 'Bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  buttonText: {
    color: '#000',
    fontFamily: 'SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  lockedFeature: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  lockedText: {
    color: theme.textColor,
    fontFamily: 'Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  lockedSubtext: {
    color: theme.textColor,
    fontFamily: 'Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});

/**
 * IMPLEMENTATION CHECKLIST:
 * 
 * ✅ 1. Installed react-native-purchases and react-native-purchases-ui
 * ✅ 2. Configured with API key: test_oJYYldTXxyvwFzHGxpwACDlSfvH
 * ✅ 3. Set up entitlement checking for PRO
 * ✅ 4. Configured product: premium_monthly
 * ✅ 5. Created Paywall component with PaywallFooterContainerView
 * ✅ 6. Created Customer Center component
 * ✅ 7. Integrated with registration flow (OnboardingComplete)
 * ✅ 8. Integrated with login flow
 * ✅ 9. Added RevenueCat logout to LogoutUser
 * ✅ 10. Created useProStatus hook for easy access
 * ✅ 11. Initialized RevenueCat in app/_layout.tsx
 * 
 * NEXT STEPS:
 * 
 * 1. Configure your offerings in RevenueCat Dashboard:
 *    - Go to https://app.revenuecat.com
 *    - Create an offering with identifier "default"
 *    - Add your product "premium_monthly"
 *    - Configure the entitlement "PRO"
 * 
 * 2. Test the integration:
 *    - Use RevenueCat's test mode
 *    - Try purchasing a subscription
 *    - Verify the entitlement is granted
 *    - Test restore purchases
 * 
 * 3. Add Paywall to your Profile screen:
 *    - Import the Paywall component
 *    - Add a button to show the paywall for free users
 *    - Add Customer Center for PRO users
 * 
 * 4. Protect premium features:
 *    - Use useProStatus hook to check PRO status
 *    - Show locked state for free users
 *    - Direct free users to paywall
 * 
 * 5. Configure iOS/Android products:
 *    - Add products in App Store Connect
 *    - Add products in Google Play Console
 *    - Link them in RevenueCat Dashboard
 */
