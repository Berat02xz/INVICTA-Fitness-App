import calculateCaloriesPerDay from "./CalculateCaloriesPerDay";

interface CaloriePlan {
  type: string;
  rate: string;
  caloriesPerDay: number;
}

function calculateBMR({
  age,
  sex = "male",
  height,
  weight,
  unit,
}: {
  age: number;
  sex: "male" | "female";
  height: number | string;
  weight: number;
  unit: "metric" | "imperial";
}): number {
  let weightKg = weight;
  let heightCm: number;

  if (unit === "imperial") {
    weightKg = weight * 0.453592;
    if (typeof height === "string") {
      const [feet, inches] = height.split("'").map((part) => parseInt(part.trim(), 10));
      const totalInches = (feet || 0) * 12 + (inches || 0);
      heightCm = totalInches * 2.54;
    } else {
      heightCm = height * 2.54;
    }
  } else {
    heightCm = typeof height === "number" ? height : parseFloat(height);
  }

  return Math.round(
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  );
}

export function getCaloriePlans({
  age,
  sex,
  height,
  weight,
  unit,
  activity_level,
}: {
  age: number;
  sex: "male" | "female";
  height: number | string;
  weight: number;
  unit: "metric" | "imperial";
  activity_level: "Sedentary" | "Slightly Active" | "Moderately Active" | "Very Active";
}): CaloriePlan[] {
  // Calculate TDEE (maintenance)
  const tdee = calculateCaloriesPerDay({
    age,
    sex,
    height,
    weight,
    unit,
    activity_level,
  });

  // Calculate BMR for safety floor
  const bmr = calculateBMR({ age, sex, height, weight, unit });

  // Minimum safe calories (never go below BMR or 1200 kcal)
  const minSafeCalories = Math.max(bmr-300, 1200);

  const plans: CaloriePlan[] = [
    {
      type: "Maintain weight",
      rate: "",
      caloriesPerDay: tdee,
    },
    {
      type: "Mild weight loss",
      rate: "-0.25 kg/week",
      caloriesPerDay: Math.round(tdee - 275),
    },
    {
      type: "Active weight loss",
      rate: "-0.5 kg/week",
      caloriesPerDay: Math.round(tdee - 550),
    },
    {
      type: "Extreme weight loss",
      rate: "-1 kg/week",
      caloriesPerDay: Math.round(tdee - 1100),
    },
  ];

  // Filter out plans that fall below the minimum safe calorie threshold
  const safePlans = plans.filter(plan => plan.caloriesPerDay >= minSafeCalories);

  return safePlans;
}
