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
          <Text style={styles.greeting}>Hey, {userData?.name?.split(" ")[0]}! 👋</Text>
          <Text style={styles.greetingSubtitle}>{userData?.email}</Text>
        </View>

        {/* Pills Row */}
        <View style={styles.pillsRow}>
          {/* Rank Pill */}
          <View style={styles.rankPill}>
            <Ionicons name="star" size={16} color={theme.primary} />
            <View style={styles.rankPillContent}>
              <Text style={styles.rankPillLabel}>Rank</Text>
              <Text style={styles.rankPillValue}>ELITE</Text>
            </View>
            <Text style={styles.rankPillPoints}>2,450 PTS</Text>
          </View>

          {/* Plan Pill */}
          <View style={styles.planPill}>
            <Ionicons name={userData?.role === "PREMIUM" ? "star-sharp" : "wallet"} size={16} color={userData?.role === "PREMIUM" ? "#FFD700" : theme.textColorSecondary} />
            <Text style={styles.planPillText}>
              {userData?.role === "PREMIUM" ? "Premium" : "Free"}
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
            <View style={[styles.statIconBg, { backgroundColor: "rgba(251, 9, 3, 0.1)" }]}>
              <Ionicons name="scale" size={20} color={theme.primary} />
            </View>
            <Text style={styles.statLabelModern}>Weight</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Text style={styles.statValueModern}>{userData?.weight}</Text>
              <Text style={styles.statUnitModern}>{userData?.unit === "metric" ? "kg" : "lbs"}</Text>
            </View>
            <Text style={{ fontSize: theme.fontSize.xs, color: theme.primary, fontFamily: theme.semibold }}>Edit</Text>
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
            <View style={[styles.statIconBg, { backgroundColor: "rgba(76, 175, 80, 0.1)" }]}>
              <Ionicons name="fitness" size={20} color={theme.success} />
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
            <Text style={{ fontSize: theme.fontSize.xs, color: theme.primary, fontFamily: theme.semibold }}>Edit</Text>
          </TouchableOpacity>

          {/* Age Card */}
          <TouchableOpacity
            style={styles.statCardCompact}
            onPress={() => {
              setAdjustedAge(userData?.age);
              setAgeModalVisible(true);
            }}
          >
            <View style={[styles.statIconBg, { backgroundColor: "rgba(255, 152, 0, 0.1)" }]}>
              <Ionicons name="person" size={20} color={theme.warning} />
            </View>
            <Text style={styles.statLabelModern}>Age</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Text style={styles.statValueModern}>{userData?.age}</Text>
              <Text style={styles.statUnitModern}>years</Text>
            </View>
            <Text style={{ fontSize: theme.fontSize.xs, color: theme.primary, fontFamily: theme.semibold }}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* BMI Card - Full Width Below */}
        <View style={styles.statCardModern}>
          <View style={[styles.statIconBg, { backgroundColor: "rgba(33, 150, 243, 0.1)" }]}>
            <Ionicons name="analytics" size={20} color={theme.info} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statLabelModern}>BMI</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.statValueModern}>{userData?.bmi?.toFixed(1)}</Text>
              <Text style={styles.statUnitModern}>
                {userData?.bmi < 18.5 ? "Underweight" : userData?.bmi < 25 ? "Normal" : userData?.bmi < 30 ? "Overweight" : "Obese"}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: theme.fontSize.xs, color: theme.textColorSecondary, fontFamily: theme.regular }}>Auto</Text>
        </View>
      </View>

      {/* Fitness Settings */}
      <Text style={styles.sectionTitle}>Fitness Settings</Text>

      <TouchableOpacity
        style={styles.settingCardModern}
        onPress={() => setFitnessLevelModalVisible(true)}
      >
        <View style={[styles.iconCircle, { backgroundColor: "rgba(251, 9, 3, 0.1)" }]}>
          <Ionicons name="barbell" size={22} color={theme.primary} />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Fitness Level</Text>
          <Text style={styles.settingValueModern}>{userData?.fitnessLevel || "Not set"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.textColorSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingCardModern}
        onPress={() => setEquipmentModalVisible(true)}
      >
        <View style={[styles.iconCircle, { backgroundColor: "rgba(76, 175, 80, 0.1)" }]}>
          <Ionicons name="build" size={22} color={theme.success} />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Equipment Access</Text>
          <Text style={styles.settingValueModern}>{userData?.equipmentAccess || "Not set"}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.textColorSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingCardModern}
        onPress={() => setCalorieModalVisible(true)}
      >
        <View style={[styles.iconCircle, { backgroundColor: "rgba(255, 152, 0, 0.1)" }]}>
          <Ionicons name="nutrition" size={22} color={theme.warning} />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Daily Calories</Text>
          <Text style={styles.settingValueModern}>{userData?.caloricIntake} cal</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.textColorSecondary} />
      </TouchableOpacity>

      {/* Account Settings */}
      <Text style={styles.sectionTitle}>Account Settings</Text>

      <View style={styles.settingCardModern}>
        <View style={[styles.iconCircle, { backgroundColor: "rgba(33, 150, 243, 0.1)" }]}>
          <Ionicons name="settings" size={22} color={theme.info} />
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
        <View style={[styles.iconCircle, { backgroundColor: "rgba(156, 39, 176, 0.1)" }]}>
          <Ionicons name="card" size={22} color="#9C27B0" />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={styles.settingTitleModern}>Subscription</Text>
          <Text style={styles.settingValueModern}>
            {userData?.role === "PREMIUM" ? "Premium - $9.99/mo" : "Free Plan"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.textColorSecondary} />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.settingCardModern} onPress={handleLogout}>
        <View style={[styles.iconCircle, { backgroundColor: "rgba(244, 67, 54, 0.15)" }]}>
          <Ionicons name="log-out" size={22} color={theme.error} />
        </View>
        <View style={styles.settingMiddle}>
          <Text style={[styles.settingTitleModern, { color: theme.error }]}>Logout</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.error} />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerApp}>INVICTA Fitness</Text>
        <Text style={styles.footerVersion}>v{VERSION}</Text>
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
    backgroundColor: theme.backgroundColor,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.semibold,
    color: theme.textColor,
    textAlign: "center",
  },
  headerSection: {
    marginBottom: 24,
    gap: 12,
  },
  greetingContainer: {
    gap: 2,
  },
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  greetingSubtitle: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  pillsRow: {
    flexDirection: "row",
    gap: 12,
  },
  rankPill: {
    flex: 1,
    backgroundColor: "rgba(251, 9, 3, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(251, 9, 3, 0.15)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rankPillContent: {
    flex: 1,
    gap: 1,
  },
  rankPillLabel: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.medium,
    color: theme.textColorSecondary,
  },
  rankPillValue: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.bold,
    color: theme.primary,
  },
  rankPillPoints: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.semibold,
    color: theme.primary,
  },
  planPill: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  planPillText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
    color: theme.textColor,
  },
  sectionTitleTop: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.bold,
    color: theme.textColor,
    marginBottom: 12,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
  },
  statsGridTop: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  statCardCompact: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  statCardModern: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
    gap: 2,
  },
  statLabelModern: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.medium,
    color: theme.textColorSecondary,
  },
  statValueModern: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  statUnitModern: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
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
    fontSize: theme.fontSize.md,
    fontFamily: theme.bold,
    color: theme.textColor,
    marginBottom: 12,
    marginTop: 16,
  },
  settingCardModern: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
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
    color: theme.textColor,
  },
  settingValueModern: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  logoutCardModern: {
    marginTop: 12,
    borderColor: "rgba(244, 67, 54, 0.15)",
    justifyContent: "space-between",
  },
  footer: {
    alignItems: "center",
    marginVertical: 32,
    marginBottom: 48,
    gap: 4,
  },
  footerApp: {
    fontSize: theme.fontSize.sm,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  footerVersion: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.bold,
    color: theme.textColor,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: theme.fontSize.md,
    fontFamily: theme.regular,
    color: theme.textColor,
    marginBottom: 16,
  },
  weightAdjustContainer: {
    gap: 16,
  },
  weightDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(251, 9, 3, 0.05)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  weightDisplayContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  weightValue: {
    fontSize: theme.fontSize.xxxl,
    fontFamily: theme.bold,
    color: theme.primary,
  },
  weightUnit: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    marginBottom: 2,
  },
  adjustButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  adjustBtn: {
    flex: 1,
    height: 48,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  adjustBtnActive: {
    backgroundColor: theme.primary,
  },
  adjustBtnText: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.bold,
    color: theme.primary,
  },
  adjustBtnTextActive: {
    color: "#FFFFFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
    color: theme.textColor,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.bold,
    color: "#FFFFFF",
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalOptionSelected: {
    backgroundColor: "rgba(251, 9, 3, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginVertical: 4,
  },
  modalOptionText: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
  modalOptionSubtext: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
    marginTop: 2,
  },
  ratePill: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 0,
    alignSelf: "flex-start",
  },
  ratePillText: {
    fontSize: theme.fontSize.xs,
    fontFamily: theme.regular,
    color: "#FFFFFF",
  },
  modalOptionTextSelected: {
    fontFamily: theme.bold,
    color: theme.primary,
  },
});

