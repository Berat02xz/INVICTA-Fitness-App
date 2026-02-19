export function calculateCaloriesPerDay({
  age,
  sex,
  height,
  weight,
  unit,
  activity_level,
}: {
  age: number;
  sex: string;
  height: number | string;
  weight: number;
  unit: string;
  activity_level: string;
}): number {
  let weightKg = weight;
  let heightCm: number;

  if (unit === "imperial") {
    weightKg = weight * 0.453592;
    if (typeof height === "string") {
      if (height.includes("'")) {
        const [feet, inches] = height.split("'").map((part) => parseInt(part.trim(), 10));
        const totalInches = (feet || 0) * 12 + (inches || 0);
        heightCm = totalInches * 2.54;
      } else {
        heightCm = parseFloat(height) * 2.54;
      }
    } else {
      heightCm = height * 2.54;
    }
  } else {
    heightCm = typeof height === "number" ? height : parseFloat(height);
  }

  let bmr: number;
  if (sex === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const activityMultipliers = {
    Sedentary: 1.2,
    SlightlyActive: 1.375,
    ModeratelyActive: 1.55,
    VeryActive: 1.725,
  };

  const multiplier =
    activityMultipliers[activity_level.replace(" ", "") as keyof typeof activityMultipliers] || 1.2;

  const tdee = bmr * multiplier;

  return Math.round(tdee);
}

export default calculateCaloriesPerDay;
