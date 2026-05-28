import { Slot } from 'expo-router';
import { StyleSheet, ImageBackground, View, Animated, Dimensions } from 'react-native';
import OnboardingProvider, { useOnboarding } from './NavigationService';
import OnboardingTopBar from './OnboardingTopBar';
import { theme } from '@/constants/theme';
import { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

function OnboardingContent() {
  const { progressNow } = useOnboarding();
  const translateX = useRef(new Animated.Value(-800)).current;

  useEffect(() => {
    const progress = progressNow();
    // Animate from -800 (left) to 0 (centered) based on progress
    Animated.timing(translateX, {
      toValue: -800 + (progress * 800),
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [progressNow()]);

  return (
    <>
      <Animated.View style={[styles.backgroundImageContainer, { transform: [{ translateX }] }]}>
        <ImageBackground 
          source={require('@/assets/icons/onboarding/stroke.png')}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      </Animated.View>
      <OnboardingTopBar />
      <SafeAreaView style={styles.screenSlot} edges={['bottom']}>
        <Slot />
      </SafeAreaView>
    </>
  );
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <OnboardingProvider>
        <OnboardingContent />
      </OnboardingProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  screenSlot: {
    flex: 1,
  },
  backgroundImageContainer: {
    position: 'absolute',
    width: 965.5,
    height: 365.5,
    top: 408,
    left: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
});

