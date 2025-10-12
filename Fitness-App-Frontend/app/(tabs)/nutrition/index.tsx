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
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

const MEAL_EMOJIS = ["🍕", "🍔", "🥗", "🍜", "🍱"];
const MEAL_COLORS = [
  "rgba(255, 107, 107, 0.2)",
  "rgba(255, 184, 77, 0.2)",
  "rgba(102, 187, 106, 0.2)",
  "rgba(66, 165, 245, 0.2)",
  "rgba(171, 71, 188, 0.2)",
];

export default function NutritionScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [hidePersonalData, setHidePersonalData] = useState(false);

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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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

  const radius = 25;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(totals.calories / targetCalories, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMealEmojiAndColor = (index: number) => {
    const emojiIndex = index % MEAL_EMOJIS.length;
    return {
      emoji: MEAL_EMOJIS[emojiIndex],
      color: MEAL_COLORS[emojiIndex],
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Space */}
        <View style={styles.headerSpace} />

        {/* Total Calories Header */}
        <FadeTranslate order={0}>
          <View style={styles.caloriesHeader}>
            <View style={styles.caloriesHeaderLeft}>
              <Text style={styles.caloriesLabel}>Today's Total Calories</Text>
              <Text style={styles.caloriesValue}>
                {hidePersonalData ? "***" : (
                  <>
                    {totals.calories}
                    <Text style={styles.caloriesTarget}>/{targetCalories}</Text>
                  </>
                )}{" "}
                <Text style={styles.caloriesUnit}>kcal</Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setHidePersonalData(!hidePersonalData)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={hidePersonalData ? "eye-off" : "eye"}
                size={20}
                color={theme.textColorSecondary}
              />
            </TouchableOpacity>
          </View>
        </FadeTranslate>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <FadeTranslate order={1} style={styles.actionButtonWrapper}>
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

          <FadeTranslate order={2} style={styles.actionButtonWrapper}>
            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <MaterialCommunityIcons
                name="magnify"
                size={23}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.actionButtonText}>Search Meal</Text>
          </FadeTranslate>

          <FadeTranslate order={3} style={styles.actionButtonWrapper}>
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

          <FadeTranslate order={4} style={styles.actionButtonWrapper}>
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
            <FadeTranslate order={10}>
              <Text style={styles.sectionTitle}>Today's Meals</Text>
            </FadeTranslate>

            <View style={styles.mealsContainer}>
              {todayMeals.map((meal, index) => {
                const { emoji, color } = getMealEmojiAndColor(index);
                return (
                  <FadeTranslate key={meal.id} order={11 + index}>
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
                          {hidePersonalData ? "***" : `${meal.calories} kcal`}
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

  // Calories Header
  caloriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  caloriesHeaderLeft: {
    flex: 1,
  },
  caloriesLabel: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    opacity: 0.8,
    marginBottom: 2,
  },
  caloriesValue: {
    fontSize: 36,
    fontFamily: theme.black,
    color: "#fff",
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
  eyeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
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
