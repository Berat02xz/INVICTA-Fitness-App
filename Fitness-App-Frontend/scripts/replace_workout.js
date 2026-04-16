const fs = require('fs');

const CODE = `import React, { useState, useMemo, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  StyleSheet
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import FadeTranslate from "@/components/ui/FadeTranslate";
import {
  ROUTINES,
  type WorkoutRoutine,
} from "@/constants/workoutRoutines";
import { ExerciseApi, type ExerciseInfo } from "@/api/ExerciseApi";
import { s } from "./s";

const { width: SCREEN_W } = Dimensions.get("window");
const ROUTINE_EQUIPMENT_PILLS = ["Barbell", "Dumbbell", "Gym mat", "Pull-up bar", "Bench"];

export default function Workout() {
  const insets = useSafeAreaInsets();
  
  const [selectedRoutineFilter, setSelectedRoutineFilter] = useState("All");
  const [baseRoutines, setBaseRoutines] = useState(ROUTINES);
  
  const [exercisePool, setExercisePool] = useState<ExerciseInfo[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);

  const apiExercises = useMemo(() => {
    return exercisePool.slice(0, 15);
  }, [exercisePool]);

  useEffect(() => {
    let cancelled = false;
    setExercisesLoading(true);
    ExerciseApi.getExercises(500).then((result) => {
      if (!cancelled) {
        setExercisePool(result.exercises);
        setExercisesLoading(false);
      }
    });
    setBaseRoutines([...ROUTINES].sort(() => Math.random() - 0.5));
    return () => { cancelled = true; };
  }, []);

  const handleRoutinePress = (routine: WorkoutRoutine) => {
    router.push({
      pathname: "/(screens)/RoutineDetail",
      params: { routineId: routine.id },
    });
  };

  const parseDuration = (d: string) => parseInt(d.replace(/[^0-9]/g, ""), 10) || 0;

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
      return r.equipment.some(
        (eq) => eq.toLowerCase() === selectedRoutineFilter.toLowerCase()
      );
    });
  }, [selectedRoutineFilter, baseRoutines]);

  const totalCoins = 200;

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      
      <Image
        source={require("@/assets/icons/backgrounds/TopBackground.png")}
        style={s.topBgImage}
        resizeMode="cover"
      />
      <LinearGradient colors={["transparent", "#000"]} style={s.topBgGradient} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeTranslate order={0}>
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <Text style={s.quoteTitle}>DON\\'T{"\\n"}GIVE UP</Text>
              <Text style={s.quoteSub}>On Your Dreams</Text>
            </View>
            <View style={s.headerRight}>
              <View style={s.coinBadge}>
                <View style={s.coinIconWrap}>
                   <Text style={{ fontSize: 10 }}>💰</Text>
                </View>
                <Text style={s.coinText}>{totalCoins}</Text>
              </View>
            </View>
          </View>

          <View style={s.searchBarWrap}>
            <TouchableOpacity activeOpacity={0.8} style={s.searchBar}>
              <Ionicons name="search" size={18} color="#888" />
              <Text style={s.searchText}>Search workout</Text>
            </TouchableOpacity>
          </View>
        </FadeTranslate>

        <FadeTranslate order={0.1}>
          <Text style={s.sectionTitle}>Daily challenges</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipScroll}
          >
            {routineFilterPills.map((f, i) => {
              const active = selectedRoutineFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  onPress={() => setSelectedRoutineFilter(f)}
                  activeOpacity={0.8}
                  style={[s.chip, active && s.chipActive]}
                >
                  <Text style={[s.chipText, active && s.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
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
              snapToInterval={SCREEN_W - 40 + 16}
              decelerationRate="fast"
            >
              {filteredRoutines.map((routine) => {
                const exerciseWord = routine.name.split(" ")[0] || "Workout";
                return (
                  <TouchableOpacity
                    key={routine.id}
                    style={s.routineCardLarge}
                    activeOpacity={0.9}
                    onPress={() => handleRoutinePress(routine)}
                  >
                    <LinearGradient
                      colors={routine.gradient}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    />
                    <View style={s.routineLargeInner}>
                      <View style={s.routineMainContent}>
                         <Text style={s.routineLargeTitle}>JUST{"\\n"}LIKE{"\\n"}YOUR{"\\n"}LAST{"\\n"}WORKOUT</Text>
                         <Text style={s.routineLargeSub}>20 {exerciseWord} for win</Text>
                      </View>
                      <View style={s.routinePlayWrap}>
                         <View style={s.routinePlayBtn}>
                            <Ionicons name="play" size={20} color="#000" />
                            <Text style={s.routinePlayText}>{exerciseWord}</Text>
                         </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </FadeTranslate>

        <FadeTranslate order={0.2}>
          <View style={s.sectionHeaderRowInline}>
            <Text style={s.sectionTitleInline}>Featured Workouts</Text>
            <TouchableOpacity onPress={() => router.push("/(screens)/ExerciseList")}>
               <Text style={s.seeAllText}>View more</Text>
            </TouchableOpacity>
          </View>

          {exercisesLoading ? (
            <ActivityIndicator style={{marginTop: 40}} color="#AAFB05" />
          ) : apiExercises.length === 0 ? (
            <Text style={s.emptyText}>No exercises found.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.albumCoverScroll}
            >
               {apiExercises.map((ex) => {
                 const bodyPart = ex.bodyParts[0] ?? "";
                 return (
                   <TouchableOpacity
                     key={ex.exerciseId}
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
                 );
               })}
            </ScrollView>
          )}
        </FadeTranslate>

      </ScrollView>
    </View>
  );
}
`;

fs.writeFileSync('app/(tabs)/workout/index.tsx', CODE);
console.log('done modifying');
