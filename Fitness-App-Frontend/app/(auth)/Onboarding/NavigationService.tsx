// app/(auth)/onboarding/OnboardingContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'expo-router';

export const OnboardingScreens = [
  'FitnessGoal',
  'HowDoYouLookRightNow',
  'TestScreen',
];

type OnboardingContextType = {
  index: number;
  goForward: () => void;
  goBack: () => void;
  progressNow: () => number;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return context;
};

export const OnboardingProvider = ({ children }: { children: React.ReactNode }) => {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const goForward = () => {
    if (index < OnboardingScreens.length - 1) {
      const next = index + 1;
      setIndex(next);
      router.push(`/Onboarding/${OnboardingScreens[next]}`);
    }
  };

  const goBack = () => {
    if (index > 0) {
      const prev = index - 1;
      setIndex(prev);
      router.push(`/Onboarding/${OnboardingScreens[prev]}`);
    }
  };

  const progressNow = () => (index + 1) / OnboardingScreens.length;

  return (
    <OnboardingContext.Provider value={{ index, goForward, goBack, progressNow }}>
      {children}
    </OnboardingContext.Provider>
  );
};
