import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { theme } from "@/constants/theme";
import { User } from "@/models/User";
import { database } from "@/database/database";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { removeToken } from "@/api/AxiosInstance";
import calculateBMI from "@/utils/CalculateBMI";
import { getCaloriePlans } from "@/utils/GetCaloriePlans";
import UnitSwitch from "@/components/ui/UnitSwitch";

const VERSION = "1.0.0";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [adjustedWeight, setAdjustedWeight] = useState(0);
  const [weightEditMode, setWeightEditMode] = useState(false);
  const [heightModalVisible, setHeightModalVisible] = useState(false);
  const [adjustedHeight, setAdjustedHeight] = useState(0);
  const [adjustedHeightFeet, setAdjustedHeightFeet] = useState(0);
  const [adjustedHeightInches, setAdjustedHeightInches] = useState(0);
  const [heightEditMode, setHeightEditMode] = useState(false);
  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [adjustedAge, setAdjustedAge] = useState(0);
  const [ageEditMode, setAgeEditMode] = useState(false);
  const [fitnessLevelModalVisible, setFitnessLevelModalVisible] = useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [calorieModalVisible, setCalorieModalVisible] = useState(false);
  const [caloriePlans, setCaloriePlans] = useState<any[]>([]);

  const fitnessLevels = ["Beginner", "Intermediate", "Advanced", "Gym Enthusiast"];
  const equipmentOptions = [
    { label: "Home Workouts", value: "Home Workouts" },
    { label: "Basic Equipment", value: "Basic Equipment" },
    { label: "Gym Access", value: "Gym Access" },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        setUserData({
          name: user.name,
          email: user.email,
          weight: user.weight,
          height: user.height,
          age: user.age,
          gender: user.gender,
          bmi: user.bmi,
          fitnessLevel: user.fitnessLevel,
          equipmentAccess: user.equipmentAccess,
          activityLevel: user.activityLevel,
          goal: user.goal,
          caloricIntake: user.caloricIntake,
          role: user.role,
          unit: user.unit,
        });

        // Calculate calorie plans
        const plans = getCaloriePlans({
          age: user.age,
          sex: user.gender,
          height: user.height,
          weight: user.weight,
          unit: user.unit,
          activity_level: user.activityLevel,
        });
        setCaloriePlans(plans);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          removeToken();
          router.push("/(auth)/login");
        },
      },
    ]);
  };

  const handleUpdateWeight = async () => {
    if (adjustedWeight === userData?.weight) {
      Alert.alert("Info", "Weight is unchanged");
      return;
    }
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        const newBMI = calculateBMI(
          userData.unit as "metric" | "imperial",
          adjustedWeight.toString(),
          userData.height
        );

        await database.write(async () => {
          await user.update((u) => {
            u.weight = adjustedWeight;
            u.bmi = newBMI;
          });
        });

        setUserData({
          ...userData,
          weight: adjustedWeight,
          bmi: newBMI,
        });

        // Recalculate calorie plans with new weight
        const updatedPlans = getCaloriePlans({
          age: userData.age,
          sex: userData.gender,
          height: userData.height,
          weight: adjustedWeight,
          unit: userData.unit,
          activity_level: userData.activityLevel,
        });
        setCaloriePlans(updatedPlans);

        setWeightModalVisible(false);
        setAdjustedWeight(0);
        Alert.alert("Success", "Weight updated and BMI recalculated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update weight");
    }
  };

  const handleUpdateHeight = async () => {
    // Calculate the height to compare and update
    let heightToUpdate = adjustedHeight;
    if (userData?.unit === "imperial") {
      heightToUpdate = adjustedHeightFeet * 12 + adjustedHeightInches;
    }

    if (heightToUpdate === parseFloat(userData?.height)) {
      Alert.alert("Info", "Height is unchanged");
      return;
    }
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        const newBMI = calculateBMI(
          userData.unit as "metric" | "imperial",
          userData.weight.toString(),
          heightToUpdate.toString()
        );

        await database.write(async () => {
          await user.update((u) => {
            u.height = heightToUpdate.toString();
            u.bmi = newBMI;
          });
        });

        setUserData({
          ...userData,
          height: heightToUpdate.toString(),
          bmi: newBMI,
        });

        // Recalculate calorie plans with new height
        const updatedPlans = getCaloriePlans({
          age: userData.age,
          sex: userData.gender,
          height: heightToUpdate,
          weight: userData.weight,
          unit: userData.unit,
          activity_level: userData.activityLevel,
        });
        setCaloriePlans(updatedPlans);

        setHeightModalVisible(false);
        setAdjustedHeight(0);
        setAdjustedHeightFeet(0);
        setAdjustedHeightInches(0);
        Alert.alert("Success", "Height updated and BMI recalculated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update height");
    }
  };

  const handleUpdateAge = async () => {
    if (adjustedAge === userData?.age) {
      Alert.alert("Info", "Age is unchanged");
      return;
    }
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        await database.write(async () => {
          await user.update((u) => {
            u.age = adjustedAge;
          });
        });
        setUserData({
          ...userData,
          age: adjustedAge,
        });

        setAgeModalVisible(false);
        setAdjustedAge(0);
        Alert.alert("Success", "Age updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update age");
    }
  };

  const handleUpdateFitnessLevel = async (level: string) => {
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        await database.write(async () => {
          await user.update((u) => {
            u.fitnessLevel = level;
          });
        });
        setUserData({ ...userData, fitnessLevel: level });
        setFitnessLevelModalVisible(false);
        Alert.alert("Success", "Fitness level updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update fitness level");
    }
  };

  const handleUpdateEquipment = async (equipment: string) => {
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        await database.write(async () => {
          await user.update((u) => {
            u.equipmentAccess = equipment;
          });
        });
        setUserData({ ...userData, equipmentAccess: equipment });
        setEquipmentModalVisible(false);
        Alert.alert("Success", "Equipment access updated!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update equipment");
    }
  };

  const handleUpdateCaloriePlan = async (plan: any) => {
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        await database.write(async () => {
          await user.update((u) => {
            u.caloricIntake = plan.caloriesPerDay;
          });
        });
        setUserData({ ...userData, caloricIntake: plan.caloriesPerDay });
        setCalorieModalVisible(false);
        Alert.alert("Success", `Switched to "${plan.type}" plan (${plan.caloriesPerDay} cal/day)!`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update calorie plan");
    }
  };

  const handleUpdateUnit = async (newUnit: "metric" | "imperial") => {
    if (newUnit === userData?.unit) {
      return;
    }
    try {
      const user = await User.getUserDetails(database);
      if (user) {
        let newWeight = userData?.weight;
        let newHeight = userData?.height;

        // Convert weight: kg (2.20462) to lbs, or lbs / 2.20462 to kg
        if (newUnit === "imperial" && userData?.unit === "metric") {
          newWeight = parseFloat((userData?.weight * 2.20462).toFixed(2));
        } else if (newUnit === "metric" && userData?.unit === "imperial") {
          newWeight = parseFloat((userData?.weight / 2.20462).toFixed(2));
        }

        // Convert height: cm to inches (/ 2.54), or inches to cm (* 2.54)
        if (newUnit === "imperial" && userData?.unit === "metric") {
          newHeight = parseFloat((parseFloat(userData?.height) / 2.54).toFixed(2));
        } else if (newUnit === "metric" && userData?.unit === "imperial") {
          newHeight = parseFloat((parseFloat(userData?.height) * 2.54).toFixed(2));
        }

        await database.write(async () => {
          await user.update((u) => {
            u.unit = newUnit;
            u.weight = newWeight;
            u.height = newHeight.toString();
          });
        });

        setUserData({
          ...userData,
          unit: newUnit,
          weight: newWeight,
          height: newHeight.toString(),
        });

        Alert.alert(
          "Success",
          `Unit changed to ${newUnit === "metric" ? "Metric (kg, cm)" : "Imperial (lbs, in)"}\n\nWeight: ${newWeight} ${newUnit === "metric" ? "kg" : "lbs"}\nHeight: ${newHeight} ${newUnit === "metric" ? "cm" : "in"}`
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update unit");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Hey, {userData?.name?.split(" ")[0]}!</Text>
          <Text style={styles.greetingSubtitle}>{userData?.email}</Text>
        </View>

        {/* Pills Row */}
        <View style={styles.pillsRow}>
          {/* Rank Pill */}
          <View style={styles.rankPill}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name="trophy" size={16} color="#D97706" />
            </View>
            <View style={styles.rankPillContent}>
              <Text style={styles.rankPillLabel}>Rank</Text>
              <Text style={styles.rankPillValue}>Elite</Text>
            </View>
            <Text style={styles.rankPillPoints}>2,450 pts</Text>
          </View>

          {/* Plan Pill */}
          <View style={styles.planPill}>
            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: userData?.role === "PREMIUM" ? "#FEF3C7" : "#F3F4F6", justifyContent: "center", alignItems: "center" }}>
              <Ionicons name={userData?.role === "PREMIUM" ? "diamond" : "wallet-outline"} size={16} color={userData?.role === "PREMIUM" ? "#D97706" : "#6B7280"} />
            </View>
            <Text style={styles.planPillText}>
              {userData?.role === "PREMIUM" ? "Premium" : "Free Plan"}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitleTop}>Health Metrics</Text>
      <View style={styles.statsGrid}>
        {/* Weight, Height, Age - Horizontal Row */}
        <View style={styles.statsGridTop}>
          {/* Weight Card */}
          <TouchableOpacity
            style={styles.statCardCompact}
            onPress={() => {
              setAdjustedWeight(userData?.weight);
              setWeightModalVisible(true);
            }}
          >
            <View style={[styles.statIconBg, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="scale-outline" size={18} color="#EF4444" />
            </View>
            <Text style={styles.statLabelModern}>Weight</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Text style={styles.statValueModern}>{userData?.weight}</Text>
              <Text style={styles.statUnitModern}>{userData?.unit === "metric" ? "kg" : "lbs"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Height Card */}
          <TouchableOpacity
            style={styles.statCardCompact}
            onPress={() => {
              setAdjustedHeight(parseFloat(userData?.height) || 0);
              if (userData?.unit === "imperial") {
                const feet = Math.floor(parseFloat(userData?.height) / 12);
                const inches = Math.round(parseFloat(userData?.height) % 12);
                setAdjustedHeightFeet(feet);
                setAdjustedHeightInches(inches);
              }
              setHeightEditMode(false);
              setHeightModalVisible(true);
            }}
          >
            <View style={[styles.statIconBg, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="resize-outline" size={18} color="#059669" />
            </View>
            <Text style={styles.statLabelModern}>Height</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              {userData?.unit === "metric" ? (
                <>
                  <Text style={styles.statValueModern}>{userData?.height}</Text>
                  <Text style={styles.statUnitModern}>cm</Text>
                </>
              ) : (
                <>
                  <Text style={styles.statValueModern}>{Math.floor(parseFloat(userData?.height) / 12)}</Text>
                  <Text style={styles.statUnitModern}>ft</Text>
                  <Text style={styles.statValueModern}>{Math.round(parseFloat(userData?.height) % 12)}</Text>
                  <Text style={styles.statUnitModern}>in</Text>
                </>
              )}
            </View>
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Age Card */}
          <TouchableOpacity
            style={styles.statCardCompact}
            onPress={() => {
              setAdjustedAge(userData?.age);
              setAgeModalVisible(true);
            }}
          >
            <View style={[styles.statIconBg, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="calendar-outline" size={18} color="#D97706" />
            </View>
            <Text style={styles.statLabelModern}>Age</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Text style={styles.statValueModern}>{userData?.age}</Text>
              <Text style={styles.statUnitModern}>yrs</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* BMI Card - Full Width Below */}
        <View style={styles.statCardModern}>
          <View style={[styles.statIconBg, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="pulse-outline" size={18} color="#3B82F6" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabelModern}>BMI</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.statValueModern}>{userData?.bmi?.toFixed(1)}</Text>
              <View style={{ backgroundColor: userData?.bmi < 18.5 ? "#FEE2E2" : userData?.bmi < 25 ? "#D1FAE5" : userData?.bmi < 30 ? "#FEF3C7" : "#FEE2E2", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, fontFamily: theme.medium, color: userData?.bmi < 18.5 ? "#EF4444" : userData?.bmi < 25 ? "#059669" : userData?.bmi < 30 ? "#D97706" : "#EF4444" }}>
                  {userData?.bmi < 18.5 ? "Underweight" : userData?.bmi < 25 ? "Normal" : userData?.bmi < 30 ? "Overweight" : "Obese"}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ fontSize: 11, color: "#6B7280", fontFamily: theme.medium }}>Auto</Text>
          </View>
        </View>
      </View>

      {/* Fitness Settings */}
      <Text style={styles.sectionTitle}>Fitness Settings</Text>

      <TouchableOpacity
        style={styles.settingCardModern}
        onPress={() => setFitnessLevelModalVisible(true)}
      >
        <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
          <Ionicons name="barbell-outline" size={20} color="#EF4444" />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Fitness Level</Text>
          <Text style={styles.settingValueModern}>{userData?.fitnessLevel || "Not set"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingCardModern}
        onPress={() => setEquipmentModalVisible(true)}
      >
        <View style={[styles.iconCircle, { backgroundColor: "#D1FAE5" }]}>
          <Ionicons name="fitness-outline" size={20} color="#059669" />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Equipment Access</Text>
          <Text style={styles.settingValueModern}>{userData?.equipmentAccess || "Not set"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingCardModern}
        onPress={() => setCalorieModalVisible(true)}
      >
        <View style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}>
          <Ionicons name="flame-outline" size={20} color="#D97706" />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Daily Calories</Text>
          <Text style={styles.settingValueModern}>{userData?.caloricIntake} cal</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Account Settings */}
      <Text style={styles.sectionTitle}>Account</Text>

      <View style={styles.settingCardModern}>
        <View style={[styles.iconCircle, { backgroundColor: "#DBEAFE" }]}>
          <Ionicons name="options-outline" size={20} color="#3B82F6" />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Measurement Unit</Text>
          <Text style={styles.settingValueModern}>
            {userData?.unit === "metric" ? "Metric (kg, cm)" : "Imperial (lbs, in)"}
          </Text>
        </View>
        <UnitSwitch
          unit={userData?.unit === "metric" ? "metric" : "imperial"}
          onSelect={handleUpdateUnit}
          metricLabel="kg"
          imperialLabel="lbs"
        />
      </View>

      <TouchableOpacity style={styles.settingCardModern}>
        <View style={[styles.iconCircle, { backgroundColor: "#F3E8FF" }]}>
          <Ionicons name="diamond-outline" size={20} color="#9333EA" />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Subscription</Text>
          <Text style={styles.settingValueModern}>
            {userData?.role === "PREMIUM" ? "Premium · $9.99/mo" : "Free Plan"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={[styles.settingCardModern, { marginTop: 8 }]} onPress={handleLogout}>
        <View style={[styles.iconCircle, { backgroundColor: "#FEE2E2" }]}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={[styles.settingTitleModern, { color: "#EF4444" }]}>Sign Out</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#EF4444" />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerApp}>INVICTA Fitness</Text>
        <Text style={styles.footerVersion}>Version {VERSION}</Text>
      </View>

      {/* Weight Modal */}
      <Modal visible={weightModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Weight</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setWeightModalVisible(false);
                  setWeightEditMode(false);
                }}
              >
                <Ionicons name="close" size={20} color={theme.textColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.weightAdjustContainer}>
              {weightEditMode ? (
                <TextInput
                  style={styles.input}
                  placeholder="Enter weight"
                  keyboardType="decimal-pad"
                  value={adjustedWeight.toString()}
                  onChangeText={(text) => setAdjustedWeight(parseFloat(text) || 0)}
                />
              ) : (
                <TouchableOpacity
                  style={styles.weightDisplayRow}
                  onPress={() => setWeightEditMode(true)}
                >
                  <View style={styles.weightDisplayContent}>
                    <Text style={styles.weightValue}>{adjustedWeight}</Text>
                    <Text style={styles.weightUnit}>{userData?.unit === "metric" ? "kg" : "lbs"}</Text>
                  </View>
                  <Text style={{ fontSize: theme.fontSize.xs, color: theme.textColorSecondary, fontFamily: theme.regular }}>
                    (tap to edit)
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.adjustButtonsRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setAdjustedWeight(Math.max(adjustedWeight - 0.5, 0))}
                >
                  <Text style={styles.adjustBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setAdjustedWeight(adjustedWeight + 0.5)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setWeightModalVisible(false);
                  setWeightEditMode(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdateWeight}>
                <Text style={styles.confirmBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Height Modal */}
      <Modal visible={heightModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Height</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setHeightModalVisible(false);
                  setHeightEditMode(false);
                }}
              >
                <Ionicons name="close" size={20} color={theme.textColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.weightAdjustContainer}>
              {heightEditMode ? (
                userData?.unit === "metric" ? (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter height (cm)"
                    keyboardType="decimal-pad"
                    value={adjustedHeight.toString()}
                    onChangeText={(text) => setAdjustedHeight(parseFloat(text) || 0)}
                  />
                ) : (
                  <View style={{ gap: 12 }}>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: theme.fontSize.sm, fontFamily: theme.medium, color: theme.textColorSecondary, marginBottom: 6 }}>Feet</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Feet"
                          keyboardType="number-pad"
                          value={adjustedHeightFeet.toString()}
                          onChangeText={(text) => setAdjustedHeightFeet(parseInt(text) || 0)}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: theme.fontSize.sm, fontFamily: theme.medium, color: theme.textColorSecondary, marginBottom: 6 }}>Inches</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Inches"
                          keyboardType="number-pad"
                          maxLength={2}
                          value={adjustedHeightInches.toString()}
                          onChangeText={(text) => {
                            const inches = parseInt(text) || 0;
                            setAdjustedHeightInches(Math.min(inches, 99));
                          }}
                        />
                      </View>
                    </View>
                  </View>
                )
              ) : (
                <TouchableOpacity
                  style={styles.weightDisplayRow}
                  onPress={() => setHeightEditMode(true)}
                >
                  <View style={styles.weightDisplayContent}>
                    {userData?.unit === "metric" ? (
                      <>
                        <Text style={styles.weightValue}>{adjustedHeight}</Text>
                        <Text style={styles.weightUnit}>cm</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.weightValue}>{adjustedHeightFeet}</Text>
                        <Text style={styles.weightUnit}>ft</Text>
                        <Text style={styles.weightValue}>{adjustedHeightInches}</Text>
                        <Text style={styles.weightUnit}>in</Text>
                      </>
                    )}
                  </View>
                  <Text style={{ fontSize: theme.fontSize.xs, color: theme.textColorSecondary, fontFamily: theme.regular }}>
                    (tap to edit)
                  </Text>
                </TouchableOpacity>
              )}

              {userData?.unit === "metric" && (
                <View style={styles.adjustButtonsRow}>
                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() => setAdjustedHeight(Math.max(adjustedHeight - 1, 0))}
                  >
                    <Text style={styles.adjustBtnText}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() => setAdjustedHeight(adjustedHeight + 1)}
                  >
                    <Text style={styles.adjustBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setHeightModalVisible(false);
                  setHeightEditMode(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdateHeight}>
                <Text style={styles.confirmBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Age Modal */}
      <Modal visible={ageModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Age</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setAgeModalVisible(false);
                  setAgeEditMode(false);
                }}
              >
                <Ionicons name="close" size={20} color={theme.textColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.weightAdjustContainer}>
              {ageEditMode ? (
                <TextInput
                  style={styles.input}
                  placeholder="Enter age"
                  keyboardType="number-pad"
                  value={adjustedAge.toString()}
                  onChangeText={(text) => setAdjustedAge(parseInt(text) || 0)}
                />
              ) : (
                <TouchableOpacity
                  style={styles.weightDisplayRow}
                  onPress={() => setAgeEditMode(true)}
                >
                  <View style={styles.weightDisplayContent}>
                    <Text style={styles.weightValue}>{adjustedAge}</Text>
                    <Text style={styles.weightUnit}>years</Text>
                  </View>
                  <Text style={{ fontSize: theme.fontSize.xs, color: theme.textColorSecondary, fontFamily: theme.regular }}>
                    (tap to edit)
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.adjustButtonsRow}>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setAdjustedAge(Math.max(adjustedAge - 1, 0))}
                >
                  <Text style={styles.adjustBtnText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => setAdjustedAge(adjustedAge + 1)}
                >
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setAgeModalVisible(false);
                  setAgeEditMode(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleUpdateAge}>
                <Text style={styles.confirmBtnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fitness Level Modal */}
      <Modal visible={fitnessLevelModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Fitness Level</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setFitnessLevelModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={theme.textColor} />
              </TouchableOpacity>
            </View>
            {fitnessLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.modalOption,
                  userData?.fitnessLevel === level && styles.modalOptionSelected,
                ]}
                onPress={() => handleUpdateFitnessLevel(level)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    userData?.fitnessLevel === level && styles.modalOptionTextSelected,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Equipment Modal */}
      <Modal visible={equipmentModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Equipment Access</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEquipmentModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={theme.textColor} />
              </TouchableOpacity>
            </View>
            {equipmentOptions.map((equipment) => (
              <TouchableOpacity
                key={equipment.value}
                style={[
                  styles.modalOption,
                  userData?.equipmentAccess === equipment.value && styles.modalOptionSelected,
                ]}
                onPress={() => handleUpdateEquipment(equipment.value)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    userData?.equipmentAccess === equipment.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {equipment.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Calorie Plan Modal */}
      <Modal visible={calorieModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Calorie Plan</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCalorieModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={theme.textColor} />
              </TouchableOpacity>
            </View>
            {caloriePlans.map((plan, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalOption,
                  userData?.caloricIntake === plan.caloriesPerDay && styles.modalOptionSelected,
                ]}
                onPress={() => handleUpdateCaloriePlan(plan)}
              >
                <View>
                  <Text
                    style={[
                      styles.modalOptionText,
                      userData?.caloricIntake === plan.caloriesPerDay && styles.modalOptionTextSelected,
                    ]}
                  >
                    {plan.type}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <Text style={styles.modalOptionSubtext}>
                      {plan.caloriesPerDay} cal/day
                    </Text>
                    {plan.rate && (
                      <View style={styles.ratePill}>
                        <Text style={styles.ratePillText}>{plan.rate}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.semibold,
    color: theme.textColor,
    textAlign: "center",
  },
  headerSection: {
    marginBottom: 28,
    gap: 16,
  },
  greetingContainer: {
    gap: 4,
  },
  greeting: {
    fontSize: 28,
    fontFamily: theme.bold,
    color: "#111827",
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.regular,
    color: "#6B7280",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 10,
  },
  rankPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  rankPillContent: {
    flex: 1,
    gap: 2,
  },
  rankPillLabel: {
    fontSize: 11,
    fontFamily: theme.medium,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rankPillValue: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.bold,
    color: "#111827",
  },
  rankPillPoints: {
    fontSize: 11,
    fontFamily: theme.semibold,
    color: "#6B7280",
  },
  planPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    borderColor: "transparent",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  planPillText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
    color: "#111827",
  },
  sectionTitleTop: {
    fontSize: 13,
    fontFamily: theme.semibold,
    color: "#9CA3AF",
    marginBottom: 12,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 20,
  },
  statsGridTop: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  statCardCompact: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "transparent",
    padding: 12,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardModern: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "transparent",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
    gap: 2,
  },
  statLabelModern: {
    fontSize: 12,
    fontFamily: theme.medium,
    color: "#9CA3AF",
  },
  statValueModern: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.bold,
    color: "#111827",
  },
  statUnitModern: {
    fontSize: 11,
    fontFamily: theme.regular,
    color: "#9CA3AF",
  },
  smallEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: theme.semibold,
    color: "#9CA3AF",
    marginBottom: 12,
    marginTop: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingCardModern: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "transparent",
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  settingMiddle: {
    flex: 1,
    gap: 2,
  },
  settingTitleModern: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
    color: "#111827",
  },
  settingValueModern: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: "#6B7280",
  },
  logoutCardModern: {
    marginTop: 12,
    borderColor: "transparent",
    justifyContent: "space-between",
  },
  footer: {
    alignItems: "center",
    marginVertical: 40,
    marginBottom: 60,
    gap: 6,
  },
  footerApp: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.semibold,
    color: "#374151",
  },
  footerVersion: {
    fontSize: 11,
    fontFamily: theme.regular,
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: theme.bold,
    color: "#111827",
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: theme.fontSize.md,
    fontFamily: theme.regular,
    color: "#111827",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  weightAdjustContainer: {
    gap: 16,
  },
  weightDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  weightDisplayContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  weightValue: {
    fontSize: 36,
    fontFamily: theme.bold,
    color: "#111827",
  },
  weightUnit: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.regular,
    color: "#6B7280",
    marginBottom: 4,
  },
  adjustButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  adjustBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  adjustBtnActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  adjustBtnText: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.bold,
    color: "#374151",
  },
  adjustBtnTextActive: {
    color: "#FFFFFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  cancelBtnText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
    color: "#374151",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.bold,
    color: "#FFFFFF",
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#F9FAFB",
  },
  modalOptionSelected: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalOptionText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.medium,
    color: "#374151",
  },
  modalOptionSubtext: {
    fontSize: 12,
    fontFamily: theme.regular,
    color: "#6B7280",
    marginTop: 2,
  },
  ratePill: {
    backgroundColor: "#059669",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 0,
    alignSelf: "flex-start",
  },
  ratePillText: {
    fontSize: 11,
    fontFamily: theme.medium,
    color: "#FFFFFF",
  },
  modalOptionTextSelected: {
    fontFamily: theme.semibold,
    color: "#FFFFFF",
  },
});

