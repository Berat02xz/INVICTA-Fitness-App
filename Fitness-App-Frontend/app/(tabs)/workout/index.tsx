import React, { useCallback, useEffect, useState, useMemo } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { theme } from "@/constants/theme";
import { User } from "@/models/User";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import FadeTranslate from "@/components/ui/FadeTranslate";
import {
  ROUTINES,
  type WorkoutRoutine,
} from "@/constants/workoutRoutines";
import { ExerciseApi, type ExerciseInfo } from "@/api/ExerciseApi";

const { width: SCREEN_W } = Dimensions.get("window");

const D = {
  bg: "#000000",
  primary: "#AAFB05",
  primaryDim: "rgba(170,251,5,0.15)",
  text: "#FFFFFF",
  sub: "#666666",
  muted: "#333333",
  card: "#121212",
  cardAlt: "#1C1C1E",
  border: "#2A2A2A",
};

// Equipment that appears in our routines (for the routine filter row)
const ROUTINE_EQUIPMENT_PILLS = ["Barbell", "Dumbbell", "Gym mat", "Pull-up bar", "Bench"];

// Curated exercise equipment filters
const EXERCISE_EQUIPMENT_FILTERS = [
  { label: "All", value: null },
  { label: "Home Workout", value: "body weight", icon: "home-outline" as const },
  { label: "Dumbbells", value: "dumbbell", icon: "barbell-outline" as const },
  { label: "Barbell", value: "barbell", icon: "barbell-outline" as const },
  { label: "Resistance Band", value: "band", icon: "fitness-outline" as const },
  { label: "Cable", value: "cable", icon: "git-commit-outline" as const },
  { label: "Kettlebell", value: "kettlebell", icon: "football-outline" as const },
];

export default function Workout() {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<any>({ name: "User" });
  const [greeting, setGreeting] = useState("Hello");
  const [streak, setStreak] = useState(0);
  const [socialMessage, setSocialMessage] = useState({ title: "", sub: "", icon: "flame" as any });
  const [totalMeals, setTotalMeals] = useState(0);
  const [weekSuccessData, setWeekSuccessData] = useState<boolean[]>(Array(7).fill(false));

  // Routine filters: difficulty, duration, or equipment name
  const [selectedRoutineFilter, setSelectedRoutineFilter] = useState("All");
  
  // Base routines (to be shuffled on open)
  const [baseRoutines, setBaseRoutines] = useState(ROUTINES);

  // Exercise filter: equipment
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  // API-fetched exercises
  const [apiExercises, setApiExercises] = useState<ExerciseInfo[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  const userLevel = Math.max(1, Math.floor(totalMeals / 2) + streak + 1);

  // Fetch exercises whenever equipment filter changes
  useEffect(() => {
    let cancelled = false;
    setExercisesLoading(true);

    const fetchExercises = async () => {
      let result: { total: number; exercises: ExerciseInfo[] };
      if (selectedEquipment) {
        result = await ExerciseApi.getExercisesByEquipment(selectedEquipment, 20);
      } else {
        result = await ExerciseApi.getExercises(20);
      }
      if (!cancelled) {
        setApiExercises(result.exercises);
        setExercisesLoading(false);
      }
    };
    fetchExercises();
    return () => { cancelled = true; };
  }, [selectedEquipment]);

  useEffect(() => {
    loadUserData();
    determineGreeting();

    const socialMessages = [
      { id: "1", title: "250+ people Working Out right now", sub: "Join the movement", icon: "flame" },
      { id: "2", title: "Today's Top Routine: Push Day", sub: "Most popular choice", icon: "barbell" },
      { id: "3", title: "89% finished their workout today", sub: "Don't fall behind", icon: "speedometer" },
      { id: "4", title: "New Records Being Set", sub: "34 PRs hit in the last hour", icon: "trophy" },
      { id: "5", title: "Global Challenge", sub: "10,000 km run combined today", icon: "earth" },
    ];
    setSocialMessage(socialMessages[Math.floor(Math.random() * socialMessages.length)]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const userId = await getUserIdFromToken();
          if (!userId) return;
          const meals = await Meal.getTodayMeals(database, userId);
          if (active) setTotalMeals(meals.length);

          const today = new Date();
          const currentDay = today.getDay();
          const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
          const monday = new Date(today);
          monday.setDate(diff);
          
          let s = 0;
          const data: boolean[] = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const ok = await Meal.DaySuccesfulCalorieIntake(database, userId, d);
            data.push(ok);
          }
          if (active) setWeekSuccessData(data);

          for (let i = currentDay === 0 ? 6 : currentDay - 1; i >= 0; i--) {
            if (data[i]) s++;
            else if (i !== (currentDay === 0 ? 6 : currentDay - 1)) break;
          }
          if (active) {
            setStreak(s);
            // Randomize routines for Today's Set
            setBaseRoutines([...ROUTINES].sort(() => Math.random() - 0.5));
          }
        } catch (e) {
          console.log(e);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const loadUserData = async () => {
    try {
      const user = await User.getUserDetails(database);
      if (user) setUserData(user);
    } catch (e) {
      console.log("Error loading user for workout screen", e);
    }
  };

  const determineGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("Good Night");
    else if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  };

  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); 
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
    const monday = new Date(today.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === new Date().toDateString();
      return {
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        isToday,
      };
    });
  };
  const weekDays = getWeekDays();

  const handleRoutinePress = (routine: WorkoutRoutine) => {
    router.push({
      pathname: "/(screens)/RoutineDetail",
      params: { routineId: routine.id },
    });
  };

  const parseDuration = (d: string) => parseInt(d.replace(/[^0-9]/g, ""), 10) || 0;

  // Combined routine filter pills: difficulty, duration, then equipment
  const routineFilterPills = [
    "All",
    "Beginner", "Intermediate", "Advanced",
    "< 30 min", "45+ min",
    ...ROUTINE_EQUIPMENT_PILLS,
  ];

  const filteredRoutines = useMemo(() => {
    if (selectedRoutineFilter === "All") return baseRoutines;
    return baseRoutines.filter((r) => {
      if (["Beginner", "Intermediate", "Advanced"].includes(selectedRoutineFilter)) {
        return r.difficulty === selectedRoutineFilter;
      }
      const mins = parseDuration(r.duration);
      if (selectedRoutineFilter === "< 30 min") return mins < 30;
      if (selectedRoutineFilter === "45+ min") return mins >= 45;
      // Equipment filter
      return r.equipment.some(
        (eq) => eq.toLowerCase() === selectedRoutineFilter.toLowerCase()
      );
    });
  }, [selectedRoutineFilter]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Background Image */}
      <Image
        source={require("@/assets/icons/backgrounds/TopBackground.png")}
        style={s.topBgImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", D.bg]}
        style={s.topBgGradient}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeTranslate order={0}>
          {/* Top Header */}
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={s.avatarWrap} activeOpacity={0.8}>
                <Text style={s.avatarLetter}>{userData.name?.substring(0, 1).toUpperCase()}</Text>
              </TouchableOpacity>
              <Text style={s.greetingText}>{greeting}</Text>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity 
                style={s.levelBadge} 
                activeOpacity={0.8}
                onPress={() => router.push("/(screens)/Roadmap")}
              >
                <View style={s.levelIconWrap}>
                  <Text style={{ fontSize: 12 }}>🔥</Text>
                </View>
                <Text style={s.levelText}>{streak} Day{streak !== 1 ? 's' : ''}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </FadeTranslate>

        {/* Weekly Activity Area */}
        <FadeTranslate order={0.1}>
          <BlurView intensity={70} experimentalBlurMethod="dimezisBlurView" tint="dark" style={s.streakContainer}>
            <View style={s.streakHeader}>
              <View style={s.streakLeft}>
                <View style={s.fireIconWrap}>
                  <Ionicons name={socialMessage.icon || "flame"} size={20} color={D.primary} />
                </View>
                <View>
                  <Text style={s.streakTitle}>{socialMessage.title || "Loading..."}</Text>
                  <Text style={s.streakSub}>{socialMessage.sub || "..."}</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </FadeTranslate>

        {/* Routines List */}
        <FadeTranslate order={0.2}>
          <Text style={s.sectionTitle}>Today&apos;s Sets</Text>

          {/* Routine Type Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipScroll}
          >
            {routineFilterPills.map((f, i) => {
              const active = selectedRoutineFilter === f;
              return (
                <FadeTranslate key={f} delay={i * 100} order={0.2} direction="x" translateXFrom={15}>
                  <TouchableOpacity
                    onPress={() => setSelectedRoutineFilter(f)}
                    activeOpacity={0.8}
                    style={[s.chip, active && s.chipActive]}
                  >
                    <Text style={[s.chipText, active && s.chipTextActive]}>{f}</Text>
                  </TouchableOpacity>
                </FadeTranslate>
              );
            })}
          </ScrollView>

          {filteredRoutines.length === 0 ? (
            <Text style={s.emptyText}>No routines match your filter.</Text>
          ) : (
            <ScrollView
              key={selectedRoutineFilter}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.routinesWheelRow}
              snapToInterval={260 + 16}
              decelerationRate="fast"
            >
              {filteredRoutines.map((routine, index) => {
                const isSpecial = index === 0; // The first one acts as the "recommended/special" routine
                return (
                  <FadeTranslate key={routine.id} delay={index * 150} order={0.2} direction="x" translateXFrom={20}>
                    <TouchableOpacity
                      style={[
                        s.routineCard,
                        isSpecial && {
                          borderWidth: 2,
                          borderColor: D.primary,
                          shadowColor: D.primary,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 10,
                          elevation: 8,
                        }
                      ]}
                      activeOpacity={0.9}
                      onPress={() => handleRoutinePress(routine)}
                    >
                      <LinearGradient
                        colors={routine.gradient}
                        style={StyleSheet.absoluteFillObject}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={s.routineCardInner}>
                        <View style={s.routineCardTop}>
                          <Text style={s.routineCardEmoji}>{routine.emoji}</Text>
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            <View style={s.routineDiffPill}>
                              <Text style={s.routineDiffText}>{routine.difficulty}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={s.routineCardBottom}>
                          <Text style={s.routineCardTitle} numberOfLines={2}>{routine.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={s.routineCardSub}>{routine.duration}</Text>
                            {isSpecial && (
                              <View style={[s.routineDiffPill, { backgroundColor: D.primary, paddingHorizontal: 6, paddingVertical: 2 }]}>
                                <Text style={[s.routineDiffText, { color: '#000', fontSize: 9 }]}>RECOMMENDED</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </FadeTranslate>
                );
              })}
            </ScrollView>
          )}
        </FadeTranslate>

        {/* Discover Exercises "Album" Style List */}
        <FadeTranslate order={0.3}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitleInline}>Discover Exercises</Text>
            <TouchableOpacity onPress={() => router.push("/(screens)/ExerciseList")}>
               <Text style={s.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.smChipScroll}>
             {EXERCISE_EQUIPMENT_FILTERS.map((eq, i) => {
               const active = selectedEquipment === eq.value;
               return (
                  <FadeTranslate key={eq.label} delay={i * 100} order={0.3} direction="x" translateXFrom={15}>
                    <TouchableOpacity
                      onPress={() => setSelectedEquipment(eq.value)}
                      style={[s.smChip, active && s.smChipActive]}
                      activeOpacity={0.8}
                    >
                       <Text style={[s.smChipText, active && s.smChipTextActive]}>{eq.label}</Text>
                    </TouchableOpacity>
                  </FadeTranslate>
               )
             })}
          </ScrollView>
        </FadeTranslate>

        {exercisesLoading ? (
          <ActivityIndicator style={{marginTop: 40}} color={D.primary} />
        ) : apiExercises.length === 0 ? (
          <FadeTranslate order={0.4}>
            <Text style={s.emptyText}>No exercises found.</Text>
          </FadeTranslate>
        ) : (
          <ScrollView
            key={selectedEquipment}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.albumCoverScroll}
          >
             {apiExercises.map((ex, index) => {
               const bodyPart = ex.bodyParts[0] ?? "";
               return (
                 <FadeTranslate key={ex.exerciseId} delay={index * 150} order={0.4} direction="x" translateXFrom={20}>
                   <TouchableOpacity
                     style={s.albumCard}
                     activeOpacity={0.8}
                     onPress={() => router.push({ pathname: "/(screens)/ExerciseDetail", params: { exerciseId: ex.exerciseId } })}
                   >
                     <View style={s.albumArtWrap}>
                       {ex.gifUrl ? (
                         <Image source={{uri: ex.gifUrl}} style={s.albumArt} />
                         ) : (
                           <Ionicons name="barbell" size={40} color="#333" />
                         )}
                      </View>
                      <Text style={s.albumTitle} numberOfLines={1}>{ex.name}</Text>
                      <Text style={s.albumSub} numberOfLines={1}>{ex.equipments[0] ?? bodyPart}</Text>
                   </TouchableOpacity>
                 </FadeTranslate>
                 );
               })}
            </ScrollView>
          )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  topBgImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 1,
    opacity: 0.4,
  },
  topBgGradient: {
    position: "absolute",
    top: Dimensions.get("window").height * 0,
    left: 0,
    right: 0,
    height: Dimensions.get("window").height * 1,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 110 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: D.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#000',
    fontFamily: theme.bold,
    fontSize: 16,
  },
  greetingText: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: D.primaryDim,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  levelIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: D.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  levelText: {
    fontSize: 13,
    fontFamily: theme.bold,
    color: D.primary,
  },

  chipScroll: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: D.primary,
  },
  chipText: {
    color: '#fff',
    fontFamily: theme.medium,
    fontSize: 14,
  },
  chipTextActive: {
    color: '#000',
    fontFamily: theme.bold,
  },

  streakContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fireIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(170,251,5,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 18,
  },
  streakSub: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: theme.medium,
    fontSize: 13,
  },
  weekCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayCol: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: 38,
    height: 56,
    borderRadius: 19,
    backgroundColor: 'transparent',
  },
  weekDayColToday: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  weekDayColWin: {
    backgroundColor: 'rgba(170,251,5,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(170,251,5,0.3)',
  },
  weekDayLtr: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: theme.bold,
    fontSize: 13,
  },
  weekDayLtrToday: {
    color: '#fff',
  },
  weekDayLtrWin: {
    color: D.primary,
  },
  weekDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  weekDayDotWin: {
    backgroundColor: D.primary,
    shadowColor: D.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  weekDayDotToday: {
    backgroundColor: '#fff',
  },

  sectionTitle: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 22,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingRight: 24,
    marginBottom: 12,
  },
  sectionTitleInline: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 22,
  },
  seeAllText: {
    color: D.sub,
    fontFamily: theme.semibold,
    fontSize: 13,
  },

  emptyText: {
    color: D.sub,
    fontFamily: theme.medium,
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  routinesWheelRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  routineCard: {
    width: 260,
    height: 160,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  routineCardInner: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  routineCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routineCardEmoji: {
    fontSize: 32,
  },
  routineDiffPill: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routineDiffText: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  routineCardBottom: {
    gap: 4,
  },
  routineCardTitle: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 18,
  },
  routineCardSub: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: theme.medium,
    fontSize: 13,
  },

  smChipScroll: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  smChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  smChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  smChipText: {
    color: '#fff',
    fontFamily: theme.medium,
    fontSize: 13,
  },
  smChipTextActive: {
    color: '#000',
    fontFamily: theme.bold,
  },

  albumCoverScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  albumCard: {
    width: 140,
    marginRight: 16,
  },
  albumArtWrap: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1E',
  },
  albumTitle: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 14,
    marginBottom: 2,
  },
  albumSub: {
    color: D.sub,
    fontFamily: theme.medium,
    fontSize: 13,
  }
});
