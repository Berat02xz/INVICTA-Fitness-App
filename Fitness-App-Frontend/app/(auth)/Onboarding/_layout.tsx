import { Slot } from 'expo-router';
import OnboardingProvider from './NavigationService';
import OnboardingTopBar from './OnboardingTopBar';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
      <>
      <OnboardingProvider >
      <OnboardingTopBar  />
      <Slot />
      </OnboardingProvider>
      </>
  );
}

