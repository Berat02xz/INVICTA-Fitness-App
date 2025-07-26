import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "expo-router";

export const OnboardingScreens = [
  "FitnessGoal",
  "HowDoYouLookRightNow",
  "HowDoYouWantToLookLike",
  "ActivityLevel",
  "LastTimeHappyBodyImage",
  "HappyBodyImageResults",
  "PushUps",
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
  "CaloriePlan",
  "JourneyStartsNow",
  "AccessToEquipment",
  "OnboardingComplete",
];

type OnboardingAnswers = {
  [question: string]: string | number;
};

type OnboardingContextType = {
  index: number;
  goForward: () => void;
  goBack: () => void;
  progressNow: () => number;
  totalScreens: () => number;
  answers: OnboardingAnswers;
  saveSelection: (question: string, answer: string | number) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  return context;
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const router = useRouter();

  const goForward = () => {
    if (index < OnboardingScreens.length - 1) {
      const next = index + 1;
      setIndex(next);
      router.push(`/(auth)/Onboarding/Questions/${OnboardingScreens[next]}`);
    }
  };

  const goBack = () => {
    if (index > 0) {
      const prev = index - 1;
      setIndex(prev);
      router.push(`/(auth)/Onboarding/Questions/${OnboardingScreens[prev]}`);
    } else {
      router.push("/");
    }
  };

  const totalScreens = () => OnboardingScreens.length;

  const progressNow = () => (index + 1) / totalScreens();

  const saveSelection = (question: string, answer: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [question]: answer,
    }));
  };

  return (
    <OnboardingContext.Provider
      value={{
        index,
        goForward,
        goBack,
        progressNow,
        totalScreens,
        answers,
        saveSelection,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
