import {  OnboardingProvider,} from './NavigationService';
import OnboardingTopBar from './OnboardingTopBar';
import { Slot } from 'expo-router';

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

