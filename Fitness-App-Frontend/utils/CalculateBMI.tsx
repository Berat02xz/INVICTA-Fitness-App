export function calculateBMI(
  unit: string,
  weight: string,
  height: string
): number {
  let bmi = 0;
  const weightValue = parseFloat(weight);
  if (isNaN(weightValue) || weightValue <= 0) return 0;

  if (unit === "metric") {
    const heightInM = parseFloat(height) / 100;
    if (isNaN(heightInM) || heightInM <= 0) return 0;

    bmi = weightValue / (heightInM * heightInM);
  } else {
    // Imperial: height is in total inches (e.g., 70 for 5'10")
    const totalInches = parseFloat(height);
    if (isNaN(totalInches) || totalInches <= 0) return 0;

    bmi = (weightValue / (totalInches * totalInches)) * 703;
  }

  const bmiResult = Math.round(bmi * 10) / 10;
  return bmiResult;
}
export default calculateBMI;
