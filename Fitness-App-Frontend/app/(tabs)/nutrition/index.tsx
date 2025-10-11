import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { GetUserDetails } from "@/api/UserDataEndpoint";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import MealCard from "@/components/ui/Nutrition/MealCard";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import FadeTranslate from "@/components/ui/FadeTranslate";

const { width } = Dimensions.get("window");

export default function Nutrition() {
  const [userName, setUserName] = useState("");
  const [caloricIntake, setCaloricIntake] = useState(0);
  const [caloricDeficit, setCaloricDeficit] = useState("0");
  const [bmr, setBmr] = useState(0);
  const [weight, setWeight] = useState(0);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFats, setTotalFats] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchTodayMeals();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await GetUserDetails();
      console.log("📊 User Data from local DB:", user);
      
      if (user) {
        console.log("📊 Caloric Intake:", user.caloricIntake);
        console.log("📊 BMR:", user.bmr);
        console.log("📊 Weight:", user.weight);
        console.log("📊 Caloric Deficit:", user.caloricDeficit);
        
        setUserName(user.name);
        setCaloricIntake(user.caloricIntake || 0);
        setCaloricDeficit(user.caloricDeficit || "0");
        setBmr(user.bmr || 0);
        setWeight(user.weight || 0);
      } else {
        console.log("⚠️ No user data found in local DB");
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMeals = async () => {
    try {
      const userId = await getUserIdFromToken();
      console.log("🍽️ User ID for meals:", userId);
      if (!userId) {
        console.log("⚠️ No user ID found for fetching meals");
        return;
      }
      
      const meals = await Meal.getTodayMeals(database, userId);
      console.log("🍽️ Fetched meals:", meals.length);
      setTodayMeals(meals);
      
      // Calculate totals
      const totalCals = meals.reduce((sum, meal) => sum + meal.calories, 0);
      const totalProt = meals.reduce((sum, meal) => sum + meal.protein, 0);
      const totalCarb = meals.reduce((sum, meal) => sum + meal.carbohydrates, 0);
      const totalFat = meals.reduce((sum, meal) => sum + meal.fats, 0);
      
      console.log("🍽️ Total calories from meals:", totalCals);
      setTotalCalories(totalCals);
      setTotalProtein(Math.round(totalProt));
      setTotalCarbs(Math.round(totalCarb));
      setTotalFats(Math.round(totalFat));
    } catch (error) {
      console.error("❌ Error fetching meals:", error);
    }
  };

  const getCalorieStatus = () => {
    if (totalCalories === 0) {
      return { text: "Scan your first meal to start tracking! 🍽️", color: theme.textColorSecondary };
    }
    const remaining = caloricIntake - totalCalories;
    if (remaining < 0) {
      return { text: `Over by ${Math.abs(remaining)} kcal 🔥`, color: "#FF6B6B" };
    } else if (remaining < 200) {
      return { text: `Almost there! ${remaining} kcal left`, color: "#4ECDC4" };
    } else {
      return { text: `${remaining} kcal remaining today`, color: "#95E1D3" };
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getMealMessage = () => {
    const count = todayMeals.length;
    if (count === 0) return "Ready to start your day?";
    if (count === 1) return "You've logged 1 meal today";
    return `You've logged ${count} meals today`;
  };

  const caloriePercentage = caloricIntake > 0 ? Math.min((totalCalories / caloricIntake) * 100, 100) : 0;
  const strokeDasharray = 2 * Math.PI * 55; // Smaller radius
  const strokeDashoffset = strokeDasharray - (strokeDasharray * caloriePercentage) / 100;

  const status = getCalorieStatus();

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

        {/* Greeting */}
        <FadeTranslate order={0}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getGreeting()}, {userName || "User"}! 👋</Text>
            <Text style={styles.mealMessage}>{getMealMessage()}</Text>
          </View>
        </FadeTranslate>

        {/* Calorie Tracker Card - Compressed */}
        <FadeTranslate order={1}>
          <View style={styles.calorieCard}>
            <View style={styles.calorieContent}>
              {/* Left Side - Circular Progress */}
              <View style={styles.circularContainer}>
                <Svg width={120} height={120}>
                  {/* Background Circle */}
                  <Circle
                    cx="60"
                    cy="60"
                    r="55"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="10"
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <Circle
                    cx="60"
                    cy="60"
                    r="55"
                    stroke={totalCalories > caloricIntake ? "#FF6B6B" : theme.primary}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="60, 60"
                  />
                  {/* Current Calories */}
                  <SvgText
                    x="60"
                    y="55"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill="#fff"
                  >
                    {totalCalories}
                  </SvgText>
                  {/* Divider */}
                  <SvgText
                    x="60"
                    y="68"
                    textAnchor="middle"
                    fontSize="12"
                    fill={theme.textColorSecondary}
                  >
                    ――
                  </SvgText>
                  {/* Total Calories */}
                  <SvgText
                    x="60"
                    y="82"
                    textAnchor="middle"
                    fontSize="16"
                    fill={theme.textColorSecondary}
                  >
                    {caloricIntake}
                  </SvgText>
                </Svg>
                <Text style={styles.calorieLabel}>Daily Calories</Text>
              </View>

              {/* Right Side - Macros */}
              <View style={styles.macrosContainer}>
                <View style={styles.macroRow}>
                  <MaterialCommunityIcons name="food-drumstick" size={18} color={theme.primary} />
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{totalProtein}g</Text>
                </View>
                <View style={styles.macroRow}>
                  <MaterialCommunityIcons name="bread-slice" size={18} color={theme.primary} />
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{totalCarbs}g</Text>
                </View>
                <View style={styles.macroRow}>
                  <MaterialCommunityIcons name="water" size={18} color={theme.primary} />
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={styles.macroValue}>{totalFats}g</Text>
                </View>
              </View>
            </View>

            {/* Status Text */}
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </FadeTranslate>

        {/* Scan Button */}
        <FadeTranslate order={2}>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={() => router.push("../(screens)/ScanMeal")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="camera-plus" size={24} color="#fff" />
            <Text style={styles.scanButtonText}>Scan New Meal</Text>
          </TouchableOpacity>
        </FadeTranslate>

        {/* Today's Meals */}
        <FadeTranslate order={3}>
          <View style={styles.mealsSection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#fff" />
              <Text style={styles.sectionTitle}>Today's Meals</Text>
            </View>
            
            {todayMeals.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mealsScroll}
              >
                {todayMeals.map((meal) => (
                  <View key={meal.id} style={styles.mealCardWrapper}>
                    <MealCard
                      name={meal.mealName}
                      time={new Date(meal.createdAt).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                      calories={meal.calories}
                      protein={meal.protein}
                      carbs={meal.carbohydrates}
                      fat={meal.fats}
                      healthScore={meal.healthScore}
                      imageUrl={meal.imageUrl || undefined}
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="food-off" size={48} color={theme.textColorSecondary} />
                <Text style={styles.emptyText}>No meals scanned today</Text>
                <Text style={styles.emptySubText}>Tap the button above to start tracking</Text>
              </View>
            )}
          </View>
        </FadeTranslate>

        {/* Recipes Card */}
        <FadeTranslate order={4}>
          <View style={styles.recipesCard}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="chef-hat" size={24} color="#fff" />
              <Text style={styles.sectionTitle}>Recommended Recipes</Text>
            </View>
            <View style={styles.comingSoon}>
              <MaterialCommunityIcons name="clock-outline" size={32} color={theme.textColorSecondary} />
              <Text style={styles.comingSoonText}>Coming Soon</Text>
              <Text style={styles.comingSoonSubText}>Personalized recipes based on your goals</Text>
            </View>
          </View>
        </FadeTranslate>

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
    paddingHorizontal: 16,
  },
  headerSpace: {
    height: 120,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: theme.medium,
    textAlign: "center",
    marginTop: 100,
  },
  
  // Greeting
  greetingContainer: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 28,
    fontFamily: theme.bold,
    color: "#fff",
    marginBottom: 4,
  },
  mealMessage: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },

  // Calorie Card - Compressed
  calorieCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  calorieContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  circularContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  calorieLabel: {
    fontSize: 12,
    fontFamily: theme.semibold,
    color: theme.textColorSecondary,
    marginTop: 8,
  },
  macrosContainer: {
    flex: 1,
    marginLeft: 20,
    gap: 12,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  macroLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.medium,
    color: "#fff",
  },
  macroValue: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: theme.primary,
  },
  statusText: {
    fontSize: 14,
    fontFamily: theme.semibold,
    textAlign: "center",
    marginTop: 4,
  },

  // Scan Button
  scanButton: {
    backgroundColor: theme.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: theme.bold,
  },

  // Meals Section
  mealsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.bold,
    color: "#fff",
  },
  mealsScroll: {
    gap: 12,
    paddingRight: 16,
  },
  mealCardWrapper: {
    width: width * 0.90,
  },
  emptyState: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.semibold,
    color: theme.textColorSecondary,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    marginTop: 4,
    opacity: 0.7,
  },

  // Recipes Card
  recipesCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  comingSoon: {
    alignItems: "center",
    paddingVertical: 32,
  },
  comingSoonText: {
    fontSize: 18,
    fontFamily: theme.bold,
    color: theme.textColorSecondary,
    marginTop: 12,
  },
  comingSoonSubText: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    marginTop: 4,
    opacity: 0.7,
    textAlign: "center",
  },

  bottomPadding: {
    height: 40,
  },
});
