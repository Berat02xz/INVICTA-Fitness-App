import { useRouter } from "expo-router";
import React, { createContext, useContext, useState } from "react";

export const OnboardingScreens = [
  "FitnessGoal",
  "HowDoYouLookRightNow",
  "HowDoYouWantToLookLike",
  "ActivityLevel",
  "LastTimeHappyBodyImage",
  "HappyBodyImageResults",
  "PushUps",
  "DailyWalk",
  "HowMuchSleep",
  "HowMuchWater",
  "HydrationResults",
  "FeelBetweenMeals",
  "DietFollow",
  "DietResults",
  "HeightQuestion",
  "WeightQuestion",
  "AgeQuestion",
  "BMIResults",
  "DesiredTargetWeight",
  "JourneyStartsNow",
  "AccessToEquipment",
  "OnboardingComplete",
];

export const UserAnswers: { question: string; answer: any }[] = [];

interface OnboardingContextType {
  index: number;
  goForward: () => void;
  goBack: () => void;
  progressNow: () => number;
  saveSelection: (question: string, answer: string | number) => void;
  totalScreens: () => number;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  return context;
};

export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const goForward = () => {
    if (index < OnboardingScreens.length - 1) {
      const next = index + 1;
      setIndex(next);
      router.push(`/(auth)/Onboarding/${OnboardingScreens[next]}`);
    }
  };

  const goBack = () => {
    if (index > 0) {
      const prev = index - 1;
      setIndex(prev);
      router.push(`/(auth)/Onboarding/${OnboardingScreens[prev]}`);
    } else {
      router.push("/");
    }
  };

  const totalScreens = () => OnboardingScreens.length;

  const progressNow = () => (index + 1) / totalScreens();

  const saveSelection = (question: string, answer: string | number) => {
    const existingIndex = UserAnswers.findIndex(
      (item) => item.question === question
    );
    if (existingIndex !== -1) {
      UserAnswers[existingIndex].answer = answer;
    } else {
      UserAnswers.push({ question, answer });
    }
  };

  return (
    <OnboardingContext.Provider
      value={{ index, goForward, goBack, progressNow, saveSelection, totalScreens }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
