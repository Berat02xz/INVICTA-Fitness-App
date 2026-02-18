import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { GetUserDetails } from "@/api/UserDataEndpoint";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import FadeTranslate from "@/components/ui/FadeTranslate";
import ConfettiCannon from "react-native-confetti-cannon";

const { width } = Dimensions.get("window");

const DEFAULT_MACRO_SPLIT = {
  protein: 0.3,
  carbs: 0.4,
  fats: 0.3,
} as const;

function clamp01(value: number) {
  if (!isFinite(value) || isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function ProgressRing({
  progress,
  size,
  strokeWidth,
  color,
  showPercent,
  centerIcon,
}: {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  showPercent?: boolean;
  centerIcon?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const p = clamp01(progress);
  const dashOffset = circumference * (1 - p);
  const percentLabel = `${Math.round(p * 100)}%`;

  return (
    <View style={[styles.ringWrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {p > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
        {showPercent && (
          <SvgText
            x={size / 2}
            y={size / 2 + 5}
            fontSize={Math.max(11, Math.round(size * 0.16))}
            fontFamily={theme.semibold}
            fill={theme.textColor}
            textAnchor="middle"
          >
            {percentLabel}
          </SvgText>
        )}
      </Svg>
      {centerIcon ? <View style={styles.ringCenter}>{centerIcon}</View> : null}
    </View>
  );
}

export default function NutritionScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekSuccessData, setWeekSuccessData] = useState<boolean[]>([]);
  const isSuccessfulDay = weekSuccessData[new Date().getDay()];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = await getUserIdFromToken();
      const user = await GetUserDetails();
      setUserData(user);

      const meals = await Meal.getTodayMeals(database, userId!);
      setTodayMeals(meals);

      // Fetch success data for the week
      await fetchWeekSuccessData(userId!);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekSuccessData = async (userId: string) => {
    try {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay); // Go to Sunday of this week

      const successData: boolean[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const isSuccess = await Meal.DaySuccesfulCalorieIntake(database, userId, date);
        successData.push(isSuccess);
      }
      setWeekSuccessData(successData);
    } catch (error) {
      console.error("Error fetching week success data:", error);
      setWeekSuccessData([false, false, false, false, false, false, false]);
    }
  };

  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // Go to Sunday of this week

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const isFuture = date > today;
      days.push({
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        dayNumber: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        isFuture: isFuture,
      });
    }
    return days;
  };

  const getCurrentDateString = () => {
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    const month = today.toLocaleDateString("en-US", { month: "long" });
    const day = today.getDate();
    return { dayName, month, day };
  };

  const calculateTotals = () => {
    return todayMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbohydrates;
        acc.fats += meal.fats;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const totals = calculateTotals();
  const targetCalories = userData?.caloricIntake || 2000;
  const caloricDeficit = userData?.caloricDeficit || "Maintain weight";

  const caloriesLeft = Math.max(0, Math.round(targetCalories - totals.calories));

  const proteinTargetG = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.protein) / 4);
  const carbsTargetG = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.carbs) / 4);
  const fatsTargetG = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.fats) / 9);

  const proteinLeftG = Math.max(0, Math.round(proteinTargetG - totals.protein));
  const carbsLeftG = Math.max(0, Math.round(carbsTargetG - totals.carbs));
  const fatsLeftG = Math.max(0, Math.round(fatsTargetG - totals.fats));

  // Get dynamic message based on calorie intake
  const getCalorieMessage = () => {
    if (totals.calories === 0) {
      return { text: "Start logging", emoji: "🍽️", color: theme.textColorSecondary };
    } else if (totals.calories > targetCalories * 1.2) {
      // Way over (20% more than target)
      return { text: "Over limit", emoji: "⚠️", color: theme.error };
    } else if (totals.calories > targetCalories) {
      // Just over target
      return { text: "Slightly over", emoji: "ℹ️", color: theme.warning };
    } else if (totals.calories >= targetCalories * 0.8) {
      // Within good range (80-100% of target)
      return { text: "On track!", emoji: "✅", color: theme.success };
    } else {
      // Under target
      return { text: "Keep going", emoji: "📈", color: theme.textColorSecondary };
    }
  };

  const calorieMessage = getCalorieMessage();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMealEmojiAndColor = (meal: Meal, index: number) => {
    const palette = [theme.infoLight, theme.successLight, theme.warningLight, theme.errorLight];
    const color = palette[index % palette.length];
    const fallbackEmoji = "🍽️";
    return {
      emoji: meal.oneEmoji || fallbackEmoji,
      color,
    };
  };

  // Generate weight projection for 30 days based on caloric deficit
  const generateWeightData = () => {
    try {
      if (!userData?.weight || isNaN(userData.weight) || !isFinite(userData.weight)) {
        return [];
      }

      const currentWeight = parseFloat(String(userData.weight));
      if (currentWeight <= 0) {
        return [];
      }

      const caloricDeficit = parseFloat(String(userData.caloricDeficit || 0));
      if (isNaN(caloricDeficit)) {
        return [];
      }

      const unit = userData.unit || "metric";
      
      // Calculate daily weight loss based on unit
      let dailyWeightLoss = 0;
      if (unit === "imperial") {
        // For imperial (lbs): 1 pound = 3500 calories
        dailyWeightLoss = caloricDeficit / 3500;
      } else {
        // For metric (kg): 1 kg = 7700 calories
        dailyWeightLoss = caloricDeficit / 7700;
      }
      
      // Ensure dailyWeightLoss is valid
      if (isNaN(dailyWeightLoss) || !isFinite(dailyWeightLoss)) {
        dailyWeightLoss = 0;
      }
      
      const data = [];
      for (let day = 0; day <= 30; day++) {
        const projectedWeight = currentWeight - (dailyWeightLoss * day);
        const validWeight = Math.max(projectedWeight, currentWeight * 0.5);
        
        // Ensure each value is a valid number
        if (!isNaN(validWeight) && isFinite(validWeight) && validWeight > 0) {
          data.push(parseFloat(validWeight.toFixed(2)));
        } else {
          data.push(currentWeight);
        }
      }
      
      return data.length > 2 ? data : [];
    } catch (error) {
      console.error("Error generating weight data:", error);
      return [];
    }
  };

  const weightData = generateWeightData();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isSuccessfulDay && <ConfettiCannon count={10} origin={{ x: -10, y: 0 }} />}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSpace} />

        <FadeTranslate order={0}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nutrition</Text>
            <View style={styles.headerSubtitleRow}>
              <Text style={styles.headerSubtitle}>
                <Text style={styles.headerSubtitleStrong}>{getCurrentDateString().dayName}</Text>
                <Text style={styles.headerSubtitleRest}>, {getCurrentDateString().month} {getCurrentDateString().day}</Text>
              </Text>
              <View style={styles.statusPill}>
                <Text style={[styles.statusPillText, { color: calorieMessage.color }]}>
                  {calorieMessage.emoji} {calorieMessage.text}
                </Text>
              </View>
            </View>
          </View>
        </FadeTranslate>

        {/* Weekly Calendar */}
        <FadeTranslate order={1}>
          <View style={[styles.card, styles.cardPadded]}>
            <View style={styles.weekContainer}>
              {getWeekDays().map((day, index) => {
                const isSuccess = weekSuccessData[index];
                const isToday = day.isToday;
                const isFuture = day.isFuture;
                
                return (
                  <View
                    key={index}
                    style={[
                      styles.dayItem,
                      isToday && styles.dayItemToday,
                      !isSuccess && !isToday && !isFuture && styles.dayItemUnsuccessful,
                      isSuccess && !isToday && !isFuture && styles.dayItemSuccessful,
                      isFuture && styles.dayItemFuture,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        isToday && styles.dayNumberToday,
                        !isSuccess && !isToday && !isFuture && styles.dayNumberUnsuccessful,
                        isFuture && styles.dayNumberFuture,
                      ]}
                    >
                      {day.dayNumber}
                    </Text>
                    <Text
                      style={[
                        styles.dayName,
                        isToday && styles.dayNameToday,
                        !isSuccess && !isToday && !isFuture && styles.dayNameUnsuccessful,
                        isFuture && styles.dayNameFuture,
                      ]}
                    >
                      {day.dayName}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </FadeTranslate>

        {/* Total Calories Header */}
        <FadeTranslate order={2}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionOverline}>Calories</Text>
          </View>

          <View style={[styles.card, styles.cardPadded, styles.summaryCard]}>
            <View style={styles.caloriesSummaryRow}>
              <View style={styles.caloriesSummaryLeft}>
                <Text style={styles.caloriesLeftValue}>{caloriesLeft}</Text>
                <Text style={styles.caloriesLeftLabel}>Calories left</Text>
              </View>
              <ProgressRing
                progress={targetCalories > 0 ? totals.calories / targetCalories : 0}
                size={86}
                strokeWidth={10}
                color={theme.primary}
                showPercent={false}
                centerIcon={<Ionicons name="flame" size={18} color={theme.textColorSecondary} />}
              />
            </View>
          </View>

          <View style={styles.macroCardsGrid}>
            <View style={[styles.card, styles.macroSmallCard]}>
              <Text style={styles.macroSmallValue}>{proteinLeftG}g</Text>
              <Text style={styles.macroSmallLabel}>Protein left</Text>
              <View style={styles.macroRingRow}>
                <ProgressRing
                  progress={proteinTargetG > 0 ? totals.protein / proteinTargetG : 0}
                  size={56}
                  strokeWidth={8}
                  color={theme.info}
                  showPercent={false}
                  centerIcon={<Ionicons name="fitness" size={14} color={theme.textColorSecondary} />}
                />
              </View>
            </View>

            <View style={[styles.card, styles.macroSmallCard]}>
              <Text style={styles.macroSmallValue}>{carbsLeftG}g</Text>
              <Text style={styles.macroSmallLabel}>Carbs left</Text>
              <View style={styles.macroRingRow}>
                <ProgressRing
                  progress={carbsTargetG > 0 ? totals.carbs / carbsTargetG : 0}
                  size={56}
                  strokeWidth={8}
                  color={theme.warning}
                  showPercent={false}
                  centerIcon={<Ionicons name="leaf" size={14} color={theme.textColorSecondary} />}
                />
              </View>
            </View>

            <View style={[styles.card, styles.macroSmallCard]}>
              <Text style={styles.macroSmallValue}>{fatsLeftG}g</Text>
              <Text style={styles.macroSmallLabel}>Fat left</Text>
              <View style={styles.macroRingRow}>
                <ProgressRing
                  progress={fatsTargetG > 0 ? totals.fats / fatsTargetG : 0}
                  size={56}
                  strokeWidth={8}
                  color={theme.success}
                  showPercent={false}
                  centerIcon={<Ionicons name="water" size={14} color={theme.textColorSecondary} />}
                />
              </View>
            </View>
          </View>
        </FadeTranslate>

        {/* Action Buttons */}
        <FadeTranslate order={3}>
          <View style={[styles.card, styles.cardPadded, styles.actionsCard]}>
            <View style={styles.actionButtons}>
              <View style={styles.actionButtonWrapper}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <Ionicons name="search-outline" size={22} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={styles.actionButtonText}>Search</Text>
              </View>

              <View style={styles.actionButtonWrapper}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("../(screens)/ScanMeal")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="scan-outline" size={22} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={styles.actionButtonText}>Scan</Text>
              </View>

              <View style={styles.actionButtonWrapper}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push("../chatbot")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sparkles-outline" size={22} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={styles.actionButtonText}>Coach</Text>
              </View>

              <View style={styles.actionButtonWrapper}>
                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                  <Ionicons name="scale-outline" size={22} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={styles.actionButtonText}>Weight</Text>
              </View>
            </View>
          </View>
        </FadeTranslate>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Today's Meals Section */}
        {todayMeals.length > 0 && (
          <>
            <FadeTranslate order={7}>
              <Text style={styles.sectionTitle}>Today's Meals</Text>
            </FadeTranslate>

            <View style={styles.mealsContainer}>
              {todayMeals.map((meal, index) => {
                const { emoji, color } = getMealEmojiAndColor(meal, index);
                return (
                  <FadeTranslate key={meal.id} order={8 + index}>
                    <View style={styles.mealRow}>
                      <View style={[styles.mealEmojiCircle, { backgroundColor: color }]}>
                        <Text style={styles.mealEmoji}>{emoji}</Text>
                      </View>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{meal.mealName}</Text>
                        <Text style={styles.mealMacros}>
                          🥩 {Math.round(meal.protein)}g • 🍞{" "}
                          {Math.round(meal.carbohydrates)}g • 🥑{" "}
                          {Math.round(meal.fats)}g
                        </Text>
                      </View>
                      <View style={styles.mealRight}>
                        <Text style={styles.mealTime}>{formatTime(meal.createdAt)}</Text>
                        <Text style={styles.mealCalories}>
                          {meal.calories} kcal
                        </Text>
                      </View>
                    </View>
                  </FadeTranslate>
                );
              })}
            </View>
          </>
        )}

        {todayMeals.length === 0 && (
          <FadeTranslate order={7}>
            <View style={[styles.card, styles.cardPadded, styles.emptyMealsCard]}>
              <Text style={styles.emptyMealsTitle}>No meals logged yet</Text>
              <Text style={styles.emptyMealsSubtitle}>
                Scan a meal or add one to see calories and macros here.
              </Text>
            </View>
          </FadeTranslate>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundTertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerSpace: {
    height: 24,
  },
  loadingText: {
    color: theme.textColor,
    fontSize: theme.fontSize.md,
    fontFamily: theme.medium,
    textAlign: "center",
    marginTop: 100,
  },

  header: {
    marginBottom: 16,
    marginTop: 6,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: theme.black,
    color: theme.textColor,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    flexShrink: 1,
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerSubtitleStrong: {
    fontFamily: theme.semibold,
    color: theme.textColor,
  },
  headerSubtitleRest: {
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },

  card: {
    backgroundColor: theme.backgroundColor,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  cardPadded: {
    padding: 14,
  },

  ringWrap: {
    position: "relative",
  },
  ringCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  // Weekly Calendar
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  dayItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: theme.backgroundTertiary,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dayItemToday: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  dayItemSuccessful: {
    backgroundColor: theme.backgroundTertiary,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.success,
  },
  dayItemUnsuccessful: {
    backgroundColor: theme.backgroundTertiary,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.borderDark,
  },
  dayItemFuture: {
    backgroundColor: theme.backgroundTertiary,
    opacity: 0.7,
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: theme.textColor,
    marginBottom: 2,
  },
  dayNumberToday: {
    color: theme.textColorTertiary,
  },
  dayNumberUnsuccessful: {
    color: theme.textColorSecondary,
  },
  dayName: {
    fontSize: 10,
    fontFamily: theme.medium,
    color: theme.textColorSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dayNameToday: {
    color: 'rgba(255,255,255,0.85)',
  },
  dayNameUnsuccessful: {
    color: theme.textColorSecondary,
  },
  dayNumberFuture: {
    color: theme.borderDark,
  },
  dayNameFuture: {
    color: theme.borderDark,
  },

  // Calories Header
  caloriesHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 6,
  },
  sectionOverline: {
    fontSize: 13,
    fontFamily: theme.semibold,
    color: theme.textColorSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.border,
    flexShrink: 0,
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: theme.medium,
  },
  planText: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  planTextStrong: {
    fontFamily: theme.semibold,
    color: theme.textColor,
  },
  caloriePlanLabel: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: "#6B7280",
  },
  caloriePlanValue: {
    fontSize: 13,
    fontFamily: theme.semibold,
    color: "#111827",
  },
  caloriesValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    position: "relative",
  },
  caloriesValue: {
    fontSize: 44,
    fontFamily: theme.black,
    color: theme.textColor,
    flex: 1,
    letterSpacing: -1,
  },
  caloriesTarget: {
    fontSize: 20,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  caloriesUnit: {
    fontSize: 16,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  summaryCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  caloriesSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  caloriesSummaryLeft: {
    flex: 1,
    paddingRight: 12,
  },
  caloriesLeftValue: {
    fontSize: 38,
    fontFamily: theme.black,
    color: theme.textColor,
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  caloriesLeftLabel: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },

  macroCardsGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 18,
  },
  macroSmallCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  macroSmallValue: {
    fontSize: 18,
    fontFamily: theme.semibold,
    color: theme.textColor,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  macroSmallLabel: {
    fontSize: 12,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  macroRingRow: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  // Action Buttons
  actionsCard: {
    marginTop: 6,
    marginBottom: 6,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButtonWrapper: {
    flex: 1,
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: theme.backgroundTertiary,
    borderRadius: 18,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 8,
  },
  actionButtonText: {
    color: theme.textColorSecondary,
    fontSize: 11,
    fontFamily: theme.medium,
    textAlign: "center",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 18,
  },

  // Section Title
  sectionTitle: {
    fontSize: 13,
    fontFamily: theme.semibold,
    color: theme.textColorSecondary,
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Today's Meals
  mealsContainer: {
    marginBottom: 24,
  },

  emptyMealsCard: {
    marginBottom: 24,
  },
  emptyMealsTitle: {
    fontSize: 16,
    fontFamily: theme.semibold,
    color: theme.textColor,
    marginBottom: 6,
  },
  emptyMealsSubtitle: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    lineHeight: 18,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundColor,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  mealEmojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  mealEmoji: {
    fontSize: 22,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 15,
    fontFamily: theme.semibold,
    color: theme.textColor,
    marginBottom: 4,
  },
  mealMacros: {
    fontSize: 12,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  mealRight: {
    alignItems: "flex-end",
  },
  mealTime: {
    fontSize: 11,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 15,
    fontFamily: theme.bold,
    color: theme.textColor,
  },

  bottomPadding: {
    height: 60,
  },

  // Info Grid (if needed)
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: "48%",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 0,
    height: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 13,
    fontFamily: theme.semibold,
    color: "#9CA3AF",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  macrosContainer: {
    flex: 1,
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  macroItemCentered: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  macroEmoji: {
    fontSize: 20,
  },
  macroValue: {
    fontSize: 15,
    fontFamily: theme.semibold,
    color: "#111827",
  },
  burnedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  burnedValue: {
    fontSize: 18,
    fontFamily: theme.bold,
    color: "#111827",
  },
  burnedUnit: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: "#6B7280",
  },
  chartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  chart: {
    marginLeft: -20,
    marginRight: -20,
  },
  hiddenText: {
    fontSize: 18,
    fontFamily: theme.bold,
    color: "#9CA3AF",
  },
  noDataText: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: "#D1D5DB",
  },
  comingSoonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 0,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  comingSoonText: {
    fontSize: 14,
    fontFamily: theme.semibold,
    color: "#6B7280",
  },
});
