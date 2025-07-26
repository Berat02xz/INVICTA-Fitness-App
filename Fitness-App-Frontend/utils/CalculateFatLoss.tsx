export default function CalculateFatLoss(
  targetWeight: number,
  startingWeight: number,
  unit: string
): {
  fatLossAmount: number;
  fatLossText: string;
  targetWeightText: string;
  fatLossPercent: number;
  fatLossPercentText: string;
} {
  const fatLossAmount = Math.max(0, startingWeight - targetWeight);
  const fatLossPercent = Math.round(
    (startingWeight > 0 ? (fatLossAmount / startingWeight) * 100 : 0)
  );

  const fatLossText =
    unit === "metric"
      ? `${fatLossAmount.toFixed(1)} kg`
      : `${fatLossAmount.toFixed(1)} lb`;

  const targetWeightText =
    unit === "metric" ? `${targetWeight} kg` : `${targetWeight} lb`;

  const fatLossPercentText = `${fatLossPercent.toFixed(1)}%`;

  return {
    fatLossAmount,
    fatLossText,
    targetWeightText,
    fatLossPercent,
    fatLossPercentText,
  };
}
