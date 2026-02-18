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
import { LogoutUser } from "@/api/UserDataEndpoint";
import calculateBMI from "@/utils/CalculateBMI";
import { getCaloriePlans } from "@/utils/GetCaloriePlans";
import UnitSwitch from "@/components/ui/UnitSwitch";
import { useProStatus } from "@/hooks/useProStatus";

const VERSION = "1.0.0";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isPro, loading: proLoading } = useProStatus();
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
          await LogoutUser();
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

  const getInitials = (name?: string) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + last).toUpperCase() || "?";
  };

  const formatHeightValue = () => {
    const raw = userData?.height;
    if (raw === null || raw === undefined || raw === "") return "—";

    if (userData?.unit === "metric") {
      return `${raw} cm`;
    }

    const inchesTotal = parseFloat(raw);
    if (!Number.isFinite(inchesTotal)) return "—";
    const feet = Math.floor(inchesTotal / 12);
    const inches = Math.round(inchesTotal % 12);
    return `${feet} ft ${inches} in`;
  };

  const formatWeightValue = () => {
    const w = userData?.weight;
    if (w === null || w === undefined || Number.isNaN(w)) return "—";
    return `${w} ${userData?.unit === "metric" ? "kg" : "lbs"}`;
  };

  const formatBmiValue = () => {
    const bmi = userData?.bmi;
    if (bmi === null || bmi === undefined || !Number.isFinite(bmi)) return "—";
    const bmiNumber = Number(bmi);
    const label =
      bmiNumber < 18.5
        ? "Underweight"
        : bmiNumber < 25
          ? "Normal"
          : bmiNumber < 30
            ? "Overweight"
            : "Obese";
    return `${bmiNumber.toFixed(1)} · ${label}`;
  };

  const SettingsRow = ({
    iconName,
    iconBg,
    iconColor,
    label,
    value,
    onPress,
    showChevron = true,
    isDestructive = false,
  }: {
    iconName: any;
    iconBg: string;
    iconColor: string;
    label: string;
    value?: string;
    onPress?: () => void;
    showChevron?: boolean;
    isDestructive?: boolean;
  }) => {
    const Row = onPress ? TouchableOpacity : View;
    return (
      <Row style={styles.row} onPress={onPress as any} activeOpacity={0.7}>
        <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={18} color={iconColor} />
        </View>
        <View style={styles.rowMiddle}>
          <Text style={[styles.rowLabel, isDestructive && { color: "#FF453A" }]}>{label}</Text>
          {!!value && <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>}
        </View>
        {showChevron ? (
          <Ionicons name="chevron-forward" size={18} color="#48484A" />
        ) : null}
      </Row>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(userData?.name)}</Text>
        </View>
        <View style={styles.profileMeta}>
          <Text style={styles.profileName} numberOfLines={1}>
            {userData?.name || "Profile"}
          </Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {userData?.email || ""}
          </Text>
        </View>
        <View
          style={[
            styles.planBadge,
            isPro ? styles.planBadgePremium : styles.planBadgeFree,
          ]}
        >
          <Ionicons
            name={isPro ? "diamond" : "wallet-outline"}
            size={16}
            color={isPro ? "#FF9F0A" : "#8E8E93"}
          />
          <Text
            style={[
              styles.planBadgeText,
              isPro ? { color: "#FF9F0A" } : { color: "#8E8E93" },
            ]}
          >
            {isPro ? "PRO" : "Free"}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Health</Text>
      <View style={styles.sectionCard}>
        <SettingsRow
          iconName="scale-outline"
          iconBg="rgba(255,69,58,0.18)"
          iconColor="#FF453A"
          label="Weight"
          value={formatWeightValue()}
          onPress={() => {
            setAdjustedWeight(userData?.weight);
            setWeightModalVisible(true);
          }}
        />
        <View style={styles.separator} />
        <SettingsRow
          iconName="resize-outline"
          iconBg="rgba(48,209,88,0.18)"
          iconColor="#30D158"
          label="Height"
          value={formatHeightValue()}
          onPress={() => {
            setAdjustedHeight(parseFloat(userData?.height) || 0);
            if (userData?.unit === "imperial") {
              const inchesTotal = parseFloat(userData?.height) || 0;
              const feet = Math.floor(inchesTotal / 12);
              const inches = Math.round(inchesTotal % 12);
              setAdjustedHeightFeet(feet);
              setAdjustedHeightInches(inches);
            }
            setHeightEditMode(false);
            setHeightModalVisible(true);
          }}
        />
        <View style={styles.separator} />
        <SettingsRow
          iconName="calendar-outline"
          iconBg="rgba(255,159,10,0.18)"
          iconColor="#FF9F0A"
          label="Age"
          value={userData?.age ? `${userData?.age} yrs` : "—"}
          onPress={() => {
            setAdjustedAge(userData?.age);
            setAgeModalVisible(true);
          }}
        />
        <View style={styles.separator} />
        <SettingsRow
          iconName="pulse-outline"
          iconBg="rgba(10,132,255,0.18)"
          iconColor="#0A84FF"
          label="BMI"
          value={formatBmiValue()}
          showChevron={false}
        />
      </View>

      <Text style={styles.sectionHeader}>Fitness</Text>
      <View style={styles.sectionCard}>
        <SettingsRow
          iconName="barbell-outline"
          iconBg="rgba(255,69,58,0.18)"
          iconColor="#FF453A"
          label="Fitness Level"
          value={userData?.fitnessLevel || "Not set"}
          onPress={() => setFitnessLevelModalVisible(true)}
        />
        <View style={styles.separator} />
        <SettingsRow
          iconName="fitness-outline"
          iconBg="rgba(48,209,88,0.18)"
          iconColor="#30D158"
          label="Equipment Access"
          value={userData?.equipmentAccess || "Not set"}
          onPress={() => setEquipmentModalVisible(true)}
        />
        <View style={styles.separator} />
        <SettingsRow
          iconName="flame-outline"
          iconBg="rgba(255,159,10,0.18)"
          iconColor="#FF9F0A"
          label="Daily Calories"
          value={userData?.caloricIntake ? `${userData?.caloricIntake} cal` : "—"}
          onPress={() => setCalorieModalVisible(true)}
        />
      </View>

      <Text style={styles.sectionHeader}>Preferences</Text>
      <View style={styles.sectionCard}>
        <View style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: "rgba(10,132,255,0.18)" }]}>
            <Ionicons name="options-outline" size={18} color="#0A84FF" />
          </View>
          <View style={styles.rowMiddle}>
            <Text style={styles.rowLabel}>Measurement Unit</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
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
      </View>

      <Text style={styles.sectionHeader}>Account</Text>
      <View style={styles.sectionCard}>
        <SettingsRow
          iconName="diamond-outline"
          iconBg="rgba(255,159,10,0.18)"
          iconColor="#FF9F0A"
          label="Subscription"
          value={isPro ? "PRO" : "Free Plan"}
          showChevron={!isPro}
          onPress={!isPro ? () => router.push("/(auth)/SubscriptionCheck") : undefined}
        />
        <View style={styles.separator} />
        <SettingsRow
          iconName="log-out-outline"
          iconBg="rgba(255,69,58,0.18)"
          iconColor="#FF453A"
          label="Sign Out"
          onPress={handleLogout}
          isDestructive
        />
      </View>

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

// Design tokens for the dark profile screen
const D = {
  bg: "#141414",          // page background
  card: "#1C1C1E",        // iOS-style grouped card background
  cardAlt: "#242426",     // slightly elevated surface
  border: "#2C2C2E",      // subtle separator
  primary: theme.primary, // #AAFB05 lime green
  deepPrimary: theme.deepPrimary, // #062B0A
  text: "#FFFFFF",
  textSub: "#8E8E93",     // iOS secondary label
  textTertiary: "#48484A",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: D.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: D.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: theme.semibold,
    color: D.text,
  },

  // ── Profile header card ───────────────────────────────────────────────
  profileCard: {
    backgroundColor: D.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: D.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: D.deepPrimary,
    borderWidth: 2,
    borderColor: D.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: theme.bold,
    color: D.primary,
  },
  profileMeta: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontSize: 18,
    fontFamily: theme.bold,
    color: D.text,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: D.textSub,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
  },
  planBadgePremium: {
    backgroundColor: "rgba(255,180,0,0.12)",
    borderColor: "rgba(255,180,0,0.35)",
  },
  planBadgeFree: {
    backgroundColor: D.cardAlt,
    borderColor: D.border,
  },
  planBadgeText: {
    fontSize: 11,
    fontFamily: theme.semibold,
    letterSpacing: 0.3,
  },

  // ── Section headers ───────────────────────────────────────────────────
  sectionHeader: {
    fontSize: 11,
    fontFamily: theme.semibold,
    color: D.textSub,
    marginTop: 28,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginLeft: 4,
  },

  // ── Grouped settings card (iOS style) ─────────────────────────────────
  sectionCard: {
    backgroundColor: D.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: D.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowMiddle: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: theme.medium,
    color: D.text,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: D.textSub,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: D.border,
    marginLeft: 60,
  },

  // ── Unused legacy styles (kept to avoid breakage) ─────────────────────
  headerSection: { marginBottom: 28, gap: 16 },
  greetingContainer: { gap: 4 },
  greeting: { fontSize: 28, fontFamily: theme.bold, color: D.text, letterSpacing: -0.5 },
  greetingSubtitle: { fontSize: 14, fontFamily: theme.regular, color: D.textSub },
  pillsRow: { flexDirection: "row", gap: 10 },
  rankPill: { flex: 1, backgroundColor: D.card, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  rankPillContent: { flex: 1, gap: 2 },
  rankPillLabel: { fontSize: 11, fontFamily: theme.medium, color: D.textSub, textTransform: "uppercase", letterSpacing: 0.5 },
  rankPillValue: { fontSize: 15, fontFamily: theme.bold, color: D.text },
  rankPillPoints: { fontSize: 11, fontFamily: theme.semibold, color: D.textSub },
  planPill: { backgroundColor: D.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  planPillText: { fontSize: 15, fontFamily: theme.semibold, color: D.text },
  sectionTitleTop: { fontSize: 11, fontFamily: theme.semibold, color: D.textSub, marginBottom: 12, marginTop: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  statsGrid: { flexDirection: "column", gap: 12, marginBottom: 20 },
  statsGridTop: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  statCardCompact: { flex: 1, backgroundColor: D.card, borderRadius: 16, padding: 12, alignItems: "center", gap: 6 },
  statCardModern: { backgroundColor: D.card, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  statIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  statContent: { flex: 1, gap: 2 },
  statLabelModern: { fontSize: 12, fontFamily: theme.medium, color: D.textSub },
  statValueModern: { fontSize: 17, fontFamily: theme.bold, color: D.text },
  statUnitModern: { fontSize: 11, fontFamily: theme.regular, color: D.textSub },
  smallEditBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: D.primary, justifyContent: "center", alignItems: "center" },
  sectionTitle: { fontSize: 11, fontFamily: theme.semibold, color: D.textSub, marginBottom: 12, marginTop: 20, textTransform: "uppercase", letterSpacing: 0.5 },
  settingCardModern: { backgroundColor: D.card, borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  settingMiddle: { flex: 1, gap: 2 },
  settingTitleModern: { fontSize: 15, fontFamily: theme.semibold, color: D.text },
  settingValueModern: { fontSize: 13, fontFamily: theme.regular, color: D.textSub },
  logoutCardModern: { marginTop: 12, justifyContent: "space-between" },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    alignItems: "center",
    marginTop: 36,
    marginBottom: 20,
    gap: 4,
  },
  footerApp: {
    fontSize: 13,
    fontFamily: theme.semibold,
    color: D.textSub,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  footerVersion: {
    fontSize: 11,
    fontFamily: theme.regular,
    color: D.textTertiary,
  },

  // ── Modals ────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderColor: D.border,
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
    color: D.text,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: D.cardAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: D.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: theme.regular,
    color: D.text,
    marginBottom: 16,
    backgroundColor: D.cardAlt,
  },
  weightAdjustContainer: {
    gap: 16,
  },
  weightDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: D.cardAlt,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: D.border,
  },
  weightDisplayContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  weightValue: {
    fontSize: 40,
    fontFamily: theme.bold,
    color: D.primary,
    letterSpacing: -1,
  },
  weightUnit: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: D.textSub,
    marginBottom: 6,
  },
  adjustButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  adjustBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: D.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: D.cardAlt,
  },
  adjustBtnActive: {
    backgroundColor: D.primary,
    borderColor: D.primary,
  },
  adjustBtnText: {
    fontSize: 26,
    fontFamily: theme.bold,
    color: D.text,
  },
  adjustBtnTextActive: {
    color: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: D.border,
    alignItems: "center",
    backgroundColor: D.cardAlt,
  },
  cancelBtnText: {
    fontSize: 15,
    fontFamily: theme.semibold,
    color: D.textSub,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: D.primary,
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 15,
    fontFamily: theme.bold,
    color: "#000000",
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: D.cardAlt,
    borderWidth: 1,
    borderColor: D.border,
  },
  modalOptionSelected: {
    backgroundColor: D.deepPrimary,
    borderWidth: 1,
    borderColor: D.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  modalOptionText: {
    fontSize: 15,
    fontFamily: theme.medium,
    color: D.text,
  },
  modalOptionSubtext: {
    fontSize: 12,
    fontFamily: theme.regular,
    color: D.textSub,
    marginTop: 2,
  },
  ratePill: {
    backgroundColor: "rgba(170,251,5,0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(170,251,5,0.3)",
  },
  ratePillText: {
    fontSize: 11,
    fontFamily: theme.medium,
    color: D.primary,
  },
  modalOptionTextSelected: {
    fontFamily: theme.semibold,
    color: D.primary,
  },
});

