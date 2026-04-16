import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { Pedometer } from "expo-sensors";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { GetUserDetails } from "@/api/UserDataEndpoint";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import UserDTO from "@/models/DTO/UserDTO";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const BG_IMAGE = require("@/assets/icons/backgrounds/image 74.png");

// Calories per step ≈ 0.04 for a 70 kg person, scaled by actual weight
function calcCalories(steps: number, weightKg: number): number {
  if (!weightKg || weightKg <= 0) return steps * 0.04;
  return steps * (weightKg / 70) * 0.04;
}

// Rough distance: average stride ≈ 0.762 m (2.5 ft)
function calcDistanceKm(steps: number, heightCm: number): number {
  const stride = heightCm > 0 ? heightCm * 0.415 / 100 : 0.762; // meters
  return (steps * stride) / 1000;
}

export default function PedometerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [available, setAvailable] = useState<boolean | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [userData, setUserData] = useState<UserDTO | null>(null);

  const animatedSteps = useSharedValue(0);
  const animatedCals = useSharedValue(0);

  // Fetch user data for weight/height
  useEffect(() => {
    (async () => {
      try {
        const user = await GetUserDetails();
        setUserData(user);
      } catch (e) {
        console.error("Pedometer: failed to load user data", e);
      }
    })();
  }, []);

  // Pedometer setup
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let baseSteps = 0;

    (async () => {
      // Request runtime permission on Android 10+
      if (Platform.OS === "android") {
        const { PermissionsAndroid } = require("react-native");
        const granted = await PermissionsAndroid.request(
          "android.permission.ACTIVITY_RECOGNITION",
          {
            title: "Step Counter Permission",
            message: "Invicta needs access to your step counter to track activity.",
            buttonPositive: "Allow",
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setAvailable(false);
          return;
        }
      }

      const isAvailable = await Pedometer.isAvailableAsync();
      setAvailable(isAvailable);
      if (!isAvailable) return;

      // Get today's steps (midnight → now)
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();

      try {
        const result = await Pedometer.getStepCountAsync(start, end);
        baseSteps = result.steps;
        setStepCount(baseSteps);
      } catch {
        // getStepCountAsync may not be supported on all platforms
        baseSteps = 0;
      }

      // Watch live updates (incremental since subscription)
      subscription = Pedometer.watchStepCount((result) => {
        setStepCount(baseSteps + result.steps);
      });
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  // Animate values when stepCount changes
  useEffect(() => {
    animatedSteps.value = withTiming(stepCount, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    const weightKg = getWeightKg();
    const cals = calcCalories(stepCount, weightKg);
    animatedCals.value = withTiming(cals, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [stepCount, userData]);

  const getWeightKg = useCallback((): number => {
    if (!userData) return 70;
    const w = userData.weight;
    if (userData.unit === "imperial") return w * 0.453592;
    return w;
  }, [userData]);

  const getHeightCm = useCallback((): number => {
    if (!userData) return 170;
    const h = parseFloat(userData.height);
    if (userData.unit === "imperial") return h * 2.54;
    return h;
  }, [userData]);

  const stepsAnimatedProps = useAnimatedProps(() => ({
    text: `${Math.round(animatedSteps.value)}`,
    defaultValue: `${Math.round(animatedSteps.value)}`,
  }));

  const calsAnimatedProps = useAnimatedProps(() => ({
    text: `${Math.round(animatedCals.value)}`,
    defaultValue: `${Math.round(animatedCals.value)}`,
  }));

  const weightKg = getWeightKg();
  const heightCm = getHeightCm();
  const calories = calcCalories(stepCount, weightKg);
  const distanceKm = calcDistanceKm(stepCount, heightCm);

  return (
    <ImageBackground source={BG_IMAGE} style={s.bg} resizeMode="cover">
      {/* Dark overlay for readability */}
      <View style={s.overlay} />

      <View style={[s.container, { paddingTop: insets.top + 12 }]}>
        {/* Top bar */}
        <View style={s.topBar}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.topTitle}>Pedometer</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Center content */}
        <View style={s.center}>
          {available === false ? (
            <Text style={s.unavailable}>
              Pedometer not available on this device
            </Text>
          ) : (
            <>
              {/* Steps */}
              <View style={s.stepsContainer}>
                <AnimatedTextInput
                  underlineColorAndroid="transparent"
                  editable={false}
                  animatedProps={stepsAnimatedProps}
                  style={s.bigNumber}
                />
                <Text style={s.stepsLabel}>STEPS</Text>
              </View>

              {/* Divider */}
              <View style={s.divider} />

              {/* Stats row */}
              <View style={s.statsRow}>
                {/* Calories */}
                <View style={s.statBox}>
                  <View style={s.statIconRow}>
                    <Ionicons name="flame" size={20} color="#FF6B35" />
                  </View>
                  <AnimatedTextInput
                    underlineColorAndroid="transparent"
                    editable={false}
                    animatedProps={calsAnimatedProps}
                    style={s.statNumber}
                  />
                  <Text style={s.statLabel}>KCAL</Text>
                </View>

                {/* Distance */}
                <View style={s.statBox}>
                  <View style={s.statIconRow}>
                    <FontAwesome5 name="route" size={18} color="#4E9FFF" />
                  </View>
                  <Text style={s.statNumber}>{distanceKm.toFixed(2)}</Text>
                  <Text style={s.statLabel}>KM</Text>
                </View>

                {/* Time active (rough estimate: 1 step ≈ 0.5s of activity) */}
                <View style={s.statBox}>
                  <View style={s.statIconRow}>
                    <Ionicons name="time-outline" size={20} color="#AAFB05" />
                  </View>
                  <Text style={s.statNumber}>
                    {Math.round(stepCount * 0.5 / 60)}
                  </Text>
                  <Text style={s.statLabel}>MIN</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Bottom pill */}
        <View style={[s.bottomPill, { marginBottom: insets.bottom + 20 }]}>
          <FontAwesome5 name="walking" size={16} color="#AAFB05" />
          <Text style={s.bottomPillText}>
            {available === false
              ? "Sensor unavailable"
              : "Tracking your activity"}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    fontSize: 17,
    fontFamily: theme.bold,
    color: "#fff",
    letterSpacing: 0.5,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  unavailable: {
    fontSize: 16,
    fontFamily: theme.medium,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },

  stepsContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  bigNumber: {
    fontSize: 96,
    fontFamily: theme.black,
    color: "#FFFFFF",
    letterSpacing: -3,
    lineHeight: 110,
    textAlign: "center",
    padding: 0,
    // TextInput reset
    borderWidth: 0,
    backgroundColor: "transparent",
    minWidth: 200,
  },
  stepsLabel: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: "rgba(170,251,5, 0.8)",
    letterSpacing: 6,
    marginTop: 4,
  },

  divider: {
    width: 60,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 28,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    minWidth: 95,
  },
  statIconRow: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: theme.black,
    color: "#FFFFFF",
    textAlign: "center",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: theme.bold,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 2,
    marginTop: 4,
  },

  bottomPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    alignSelf: "center",
    backgroundColor: "rgba(170,251,5,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  bottomPillText: {
    fontSize: 13,
    fontFamily: theme.semibold,
    color: "rgba(255,255,255,0.6)",
  },
});
