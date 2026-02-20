import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
import { theme } from '@/constants/theme';
import Paywall from '@/components/ui/RevenueCat/Paywall';
import { useProStatus } from '@/hooks/useProStatus';
import SolidBackground from '@/components/ui/SolidBackground';

/**
 * Subscription Check Screen
 * Checks if user has PRO subscription after login/registration
 * Shows paywall if not subscribed, otherwise continues to app
 */
export default function SubscriptionCheck() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { isPro, loading, refresh } = useProStatus();
  const navigation = useNavigation();

  // Function to navigate and reset history
  const navigateToApp = () => {
    if (navigation.canGoBack()) {
      // If we can go back, it means we have history stack (like login/welcome)
      // We want to reset it so user can't go back to auth screens
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: '(tabs)' }],
        })
      );
    } else {
      // If no history (e.g. initial load), simple replace works
      router.replace('/(tabs)/workout');
    }
  };

  useEffect(() => {
    if (!loading && !hasChecked && !isNavigating) {
      setHasChecked(true);
      
      if (isPro) {
        // User has PRO, continue to app
        console.log('✅ User has PRO subscription, navigating to workout...');
        setIsNavigating(true);
        setTimeout(() => {
          navigateToApp();
        }, 100);
      } else {
        // User doesn't have PRO, show paywall
        console.log('🔒 User needs subscription, showing paywall...');
        setShowPaywall(true);
      }
    }
  }, [loading, hasChecked, isPro, isNavigating]);

  const handlePaywallClose = () => {
    // When user closes paywall (X button), continue to app
    console.log('🔄 handlePaywallClose called - navigating to workout...');
    if (!isNavigating) {
      setIsNavigating(true);
      setShowPaywall(false);
      navigateToApp();
      console.log('✅ Navigation command sent');
    }
  };

  const handlePurchaseCompleted = async () => {
    // When user subscribes, refresh PRO status and navigate
    console.log('✅ User subscribed, refreshing status...');
    if (!isNavigating) {
      setIsNavigating(true);
      setShowPaywall(false);
      
      // Refresh PRO status to ensure it's updated
      await refresh();
      
      // Small delay to ensure navigation doesn't conflict
      setTimeout(() => {
        navigateToApp();
      }, 500);
    }
  };

  // Show loading state while checking subscription
  if (loading || !hasChecked) {
    return (
      <>
        <SolidBackground style={StyleSheet.absoluteFill} />
        <View style={styles.container}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Checking subscription...</Text>
        </View>
      </>
    );
  }

  // Show paywall if needed
  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <Paywall
          visible={showPaywall}
          onClose={handlePaywallClose}
          onPurchaseCompleted={handlePurchaseCompleted}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: theme.fontSize.md,
    fontFamily: theme.medium,
    color: theme.textColor,
  },
});
