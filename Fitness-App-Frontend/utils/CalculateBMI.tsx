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
    const [feetStr, inchStr = "0"] = height.trim().split("'");
    const feet = parseInt(feetStr || "0", 10);
    let inches = parseInt(inchStr || "0", 10);

    // Cap inches at 11
    inches = Math.min(inches, 11);

    const totalInches = feet * 12 + inches;
    if (totalInches === 0) return 0;

    bmi = (weightValue / (totalInches * totalInches)) * 703;
  }

  const bmiResult = Math.round(bmi * 10) / 10;
  return bmiResult;
}
export default calculateBMI;
