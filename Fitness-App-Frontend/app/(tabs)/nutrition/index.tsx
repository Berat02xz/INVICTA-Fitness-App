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
import CalorieProgressChart from "@/components/ui/Nutrition/CalorieProgressChart";
import ConfettiCannon from "react-native-confetti-cannon";

const { width } = Dimensions.get("window");

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

  const radius = 25;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(totals.calories / targetCalories, 1);
  const strokeDashoffset = circumference * (1 - progress);

  // Get dynamic message based on calorie intake
  const getCalorieMessage = () => {
    if (totals.calories === 0) {
      return { text: "Start logging", emoji: "🍽️", color: theme.textColorSecondary };
    } else if (totals.calories > targetCalories * 1.2) {
      // Way over (20% more than target)
      return { text: "Over limit", emoji: "⚠️", color: "#FF6B6B" };
    } else if (totals.calories > targetCalories) {
      // Just over target
      return { text: "Slightly over", emoji: "ℹ️", color: "#FFA726" };
    } else if (totals.calories >= targetCalories * 0.8) {
      // Within good range (80-100% of target)
      return { text: "On track!", emoji: "✅", color: "#66BB6A" };
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

  // Generate a darker, desaturated random color using HSL and convert to hex.
  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const randomDarkColor = (seed?: number) => {
    // If seed provided, use it to make deterministic random via simple LCG
    let rnd = seed && seed > 0 ? (seed % 2147483647) : Math.floor(Math.random() * 2147483647);
    if (seed && seed > 0) {
      rnd = (rnd * 48271) % 2147483647;
    } else {
      rnd = Math.floor(Math.random() * 2147483647);
    }
    const rand = () => {
      rnd = (rnd * 48271) % 2147483647;
      return (rnd % 1000) / 1000;
    };

    // Hue anywhere 0..360, saturation moderate (30-60), lightness dark (18-35)
    const h = Math.floor(rand() * 360);
    const s = 35 + Math.floor(rand() * 30); // 35-65
    const l = 18 + Math.floor(rand() * 18); // 18-35
    return hslToHex(h, s, l);
  };

  const getMealEmojiAndColor = (meal: Meal, index: number) => {
    // Use index as seed so colors are somewhat stable per position in list
    const color = randomDarkColor(index + Date.now() % 1000);
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
        {/* Header Space */}
        <View style={styles.headerSpace} />

        {/* Current Date Display */}
        <FadeTranslate order={0}>
          <View style={styles.currentDateContainer}>
            <Text style={styles.currentDateText}>
              <Text style={styles.currentDateDay}>{getCurrentDateString().dayName}</Text>
              <Text style={styles.currentDateRest}>, {getCurrentDateString().month} {getCurrentDateString().day}</Text>
            </Text>
          </View>
        </FadeTranslate>

        {/* Weekly Calendar */}
        <FadeTranslate order={1}>
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
        </FadeTranslate>

        {/* Total Calories Header */}
        <FadeTranslate order={2}>
          <Text style={styles.caloriesLabel}>Today's Total Calories</Text>
          <View style={styles.caloriesValueRow}>
            <Text style={styles.caloriesValue}>
              {totals.calories}
              <Text style={styles.caloriesTarget}>/{targetCalories}</Text>
              {" "}
              <Text style={styles.caloriesUnit}>kcal</Text>
            </Text>
            
            {/* Mini Progress Chart - Right side */}
            {todayMeals.length > 0 && (
              <View style={styles.miniChartContainer}>
                <CalorieProgressChart 
                  calories={totals.calories} 
                  targetCalories={targetCalories} 
                />
              </View>
            )}
          </View>
        </FadeTranslate>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <FadeTranslate order={3} style={styles.actionButtonWrapper}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("../(screens)/ScanMeal")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="barcode-scan"
                size={23}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.actionButtonText}>Scan Meal</Text>
          </FadeTranslate>

          <FadeTranslate order={4} style={styles.actionButtonWrapper}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={23}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.actionButtonText}>Change Plan</Text>
          </FadeTranslate>

          <FadeTranslate order={5} style={styles.actionButtonWrapper}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("../(screens)/ChatBot")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="shimmer"
                size={23}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.actionButtonText}>Ask Coach</Text>
          </FadeTranslate>

          <FadeTranslate order={6} style={styles.actionButtonWrapper}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="weight-kilogram"
                size={23}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.actionButtonText}>Log Weight</Text>
          </FadeTranslate>
        </View>

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

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerSpace: {
    height: 100,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: theme.medium,
    textAlign: "center",
    marginTop: 100,
  },

  // Current Date Display
  currentDateContainer: {
    marginBottom: 16,
  },
  currentDateText: {
    fontSize: 16,
    fontFamily: theme.regular,
  },
  currentDateDay: {
    fontFamily: theme.bold,
    color: "#fff",
  },
  currentDateRest: {
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    opacity: 0.7,
  },

  // Weekly Calendar
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  dayItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  dayItemToday: {
    backgroundColor: theme.primary,
  },
  dayItemSuccessful: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  dayItemUnsuccessful: {
    opacity: 0.4,
  },
  dayItemFuture: {
    backgroundColor: "transparent",
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: "#fff",
    marginBottom: 4,
  },
  dayNumberToday: {
    color: "#fff",
  },
  dayNumberUnsuccessful: {
    color: theme.textColorSecondary,
  },
  dayName: {
    fontSize: 11,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  dayNameToday: {
    color: "#fff",
  },
  dayNameUnsuccessful: {
    color: theme.textColorSecondary,
  },
  dayNumberFuture: {
    color: theme.textColorSecondary,
    opacity: 0.5,
  },
  dayNameFuture: {
    color: theme.textColorSecondary,
    opacity: 0.5,
  },

  // Calories Header
  caloriesHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  caloriesLabel: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    opacity: 0.8,
  },
  caloriePlanLabel: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    opacity: 0.7,
  },
  caloriePlanValue: {
    fontSize: 13,
    fontFamily: theme.bold,
    color: "#fff",
  },
  caloriesValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  caloriesValue: {
    fontSize: 36,
    fontFamily: theme.black,
    color: "#fff",
    flex: 1,
  },
  caloriesTarget: {
    fontSize: 24,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    opacity: 0.6,
  },
  caloriesUnit: {
    fontSize: 18,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  miniChartContainer: {
    position: "absolute",
    right: 0,
    top: -20,
    backgroundColor: "transparent",
    overflow: "visible",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  actionButtonWrapper: {
    flex: 1,
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 40,
    width: 80,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: theme.medium,
    textAlign: "center",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 24,
  },

  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    marginBottom: 16,
  },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  gridCard: {
    width: "48%",
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    height: 160,
  },
  infoCardTitle: {
    fontSize: 13,
    fontFamily: theme.bold,
    color: "#fff",
    marginBottom: 12,
  },

  // Calories Circle
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  // Macros
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
    fontSize: 22,
  },
  macroValue: {
    fontSize: 15,
    fontFamily: theme.semibold,
    color: "#fff",
  },

  // Calories Burned
  burnedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  burnedValue: {
    fontSize: 20,
    fontFamily: theme.black,
    color: "#fff",
  },
  burnedUnit: {
    fontSize: 12,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },

  // Weight Graph
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
    fontSize: 24,
    fontFamily: theme.black,
    color: theme.textColorSecondary,
  },
  noDataText: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    opacity: 0.5,
  },

  // Today's Meals
  mealsContainer: {
    marginBottom: 32,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  mealEmojiCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mealEmoji: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 14,
    fontFamily: theme.bold,
    color: "#fff",
    marginBottom: 4,
  },
  mealMacros: {
    fontSize: 12,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    opacity: 0.7,
  },
  mealRight: {
    alignItems: "flex-end",
  },
  mealTime: {
    fontSize: 11,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    opacity: 0.7,
    marginBottom: 2,
  },
  mealCalories: {
    fontSize: 16,
    fontFamily: theme.black,
    color: "#fff",
  },

  // Coming Soon
  comingSoonCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 32,
  },
  comingSoonText: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: theme.textColorSecondary,
  },

  bottomPadding: {
    height: 40,
  },
});
