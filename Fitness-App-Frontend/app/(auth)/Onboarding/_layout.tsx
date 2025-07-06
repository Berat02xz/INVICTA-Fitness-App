import { Slot } from 'expo-router';
import Toast from 'react-native-toast-message';
import { OnboardingProvider, } from './NavigationService';
import OnboardingTopBar from './OnboardingTopBar';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
      <>
      <OnboardingProvider >
      <OnboardingTopBar  />
      <Toast />
      <Slot />
      </OnboardingProvider>
      </>
  );
}

