import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Vibration,
  Image,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { ROUTINES, RoutineExercise } from "../../constants/workoutRoutines";
import { ExerciseApi, type ExerciseInfo } from "../../api/ExerciseApi";
import SolidBackground from "../../components/ui/SolidBackground";
import FadeTranslate from "../../components/ui/FadeTranslate";
import GlassEffect from "../../components/ui/GlassEffect";
import ButtonFit from "../../components/ui/ButtonFit";
import { BlurView } from "expo-blur";
import { theme } from "../../constants/theme";
import { LikedExercise } from "../../models/LikedExercise";
import database from "../../database/database";

const MOTIVATIONAL_QUOTES = [
  "Believe you can and you're halfway there.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Hard work beats talent when talent doesn't work hard.",
  "Don't stop when you're tired. Stop when you're done.",
  "The only bad workout is the one that didn't happen.",
  "What seems impossible today will one day become your warm-up.",
  "Success starts with self-discipline.",
];

const SOCIAL_PROOF_MESSAGES = [
  "169 people are working out right now",
  "250+ users have quit after this screen",
  "42 people are doing the next exercise",
  "88% of users push through this rest",
  "317 people completed this routine today",
  "15 users are on the same set as you",
  "Only 12% skip this exercise — stay strong",
  "204 people finished their workout today",
  "You're in the top 20% for consistency this week",
  "Most users give up here. Will you?",
];

const AVATAR_POOL = [
  require('../../assets/avatars/avatar1.jpg'),
  require('../../assets/avatars/avatar2.jpg'),
  require('../../assets/avatars/avatar3.jpg'),
  require('../../assets/avatars/avatar4.jpg'),
  require('../../assets/avatars/avatar5.jpg'),
  require('../../assets/avatars/avatar6.jpg'),
  require('../../assets/avatars/avatar7.jpg'),
];

export const D = {
  bg: "#000000",
  primary: "#AAFB05",
  card: "#121212",
  cardAlt: "#1C1C1E",
  textRef: "#B3B3B7",
  border: "#2A2A2E",
  white: "#FFFFFF",
};

type Phase = "exercise" | "rest" | "complete";

export default function WorkoutPlayer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ routineId: string }>();

  const routine = ROUTINES.find((r) => r.id === params.routineId) ?? null;
  const exercises = routine?.exercises ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<Phase>("exercise");
  const currentExercise = exercises[currentIndex] ?? null;

  const getExerciseDuration = (ex: any) => ex?.durationSeconds || 300; // fallback to 5mins

  const [restTimer, setRestTimer] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState(getExerciseDuration(currentExercise));
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [exerciseInfo, setExerciseInfo] = useState<ExerciseInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  const [showHypeOverlay, setShowHypeOverlay] = useState(true);
  const hypeOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Keep overlay for 2 seconds, then animate out over 1 second
    const timer = setTimeout(() => {
      Animated.timing(hypeOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setShowHypeOverlay(false);
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch exercise info & check like status when exercise changes
  useEffect(() => {
    if (currentExercise?.exerciseId) {
      LikedExercise.isLiked(database, currentExercise.exerciseId).then(setIsLiked);
      setInfoLoading(true);
      setExerciseInfo(null);
      ExerciseApi.getExerciseById(currentExercise.exerciseId)
        .then((info) => setExerciseInfo(info))
        .catch(() => {})
        .finally(() => setInfoLoading(false));
    }
  }, [currentIndex]);

  const handleToggleLike = async () => {
    if (!currentExercise) return;
    const liked = await LikedExercise.toggle(
      database,
      currentExercise.exerciseId,
      currentExercise.name,
      currentExercise.gifUrl || "",
      currentExercise.category || "",
    );
    setIsLiked(liked);
  };

  // Bottom Sheet
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [activeSheet, setActiveSheet] = useState<"upNext" | "instruction" | null>(null);

  const handleOpenSheet = (type: "upNext" | "instruction") => {
    setActiveSheet(type);
    bottomSheetRef.current?.expand();
  };

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const timerCircleAnim = useRef(new Animated.Value(1)).current;
  const breathingScale1 = useRef(new Animated.Value(1)).current;
  const breathingScale2 = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [socialProofVisible, setSocialProofVisible] = useState(false);
  const [socialProofAvatars, setSocialProofAvatars] = useState<number[]>([]);
  const [socialProofMessage, setSocialProofMessage] = useState('');
  
  // Gamification: Burning Calories
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const fireScaleAnim = useRef(new Animated.Value(1)).current;
  const fireRotateAnim = useRef(new Animated.Value(0)).current;

  const totalExercises = exercises.length;
  
  // Keep an up-to-date ref for handleNext to avoid stale closures inside intervals
  const handleNextRef = useRef<() => void>();

  useEffect(() => {
    if (phase === "exercise" && !isPaused) {
      if (exerciseTimer <= 0) return;

      const interval = setInterval(() => {
        setExerciseTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Trigger automatic transition
            setTimeout(() => {
                if (handleNextRef.current) handleNextRef.current();
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [phase, isPaused, exerciseTimer]);

  useEffect(() => {
    if (totalExercises > 0 && currentExercise) {
      if (phase === "complete") {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      } else {
        const currentDur = getExerciseDuration(currentExercise);
        const baseProgress = currentIndex / totalExercises;
        const totalSets = currentExercise.sets || 1;
        const setFraction = 1 / totalSets;
        
        let targetProgress = baseProgress;

        if (phase === "exercise") {
          const completedSetsProgress = (currentSet - 1) * setFraction;
          const activeSetProgress = (1 - exerciseTimer / currentDur) * setFraction;
          targetProgress += (completedSetsProgress + activeSetProgress) / totalExercises;

          Animated.timing(progressAnim, {
            toValue: targetProgress,
            duration: 1000,
            useNativeDriver: false,
          }).start();
        } else if (phase === "rest") {
          const completedSetsProgress = currentSet * setFraction;
          targetProgress += completedSetsProgress / totalExercises;

          Animated.timing(progressAnim, {
            toValue: targetProgress,
            duration: 500,
            useNativeDriver: false,
          }).start();
        }
      }
    }
  }, [currentIndex, currentSet, totalExercises, phase, exerciseTimer, currentExercise]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  useEffect(() => {
    if (phase === "rest" && !isPaused) {
      setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

      // 30% chance social proof banner
      const showSocial = Math.random() < 0.30;
      setSocialProofVisible(showSocial);
      if (showSocial) {
        const indices = Array.from({ length: AVATAR_POOL.length }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setSocialProofAvatars(indices);
        setSocialProofMessage(
          SOCIAL_PROOF_MESSAGES[Math.floor(Math.random() * SOCIAL_PROOF_MESSAGES.length)]
        );
      }

      Animated.loop(
        Animated.sequence([
          Animated.timing(timerCircleAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(timerCircleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(breathingScale1, {
            toValue: 1.4,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingScale1, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(breathingScale2, {
            toValue: 1.8,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingScale2, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      timerCircleAnim.setValue(1);
      timerCircleAnim.stopAnimation();
      breathingScale1.setValue(1);
      breathingScale1.stopAnimation();
      breathingScale2.setValue(1);
      breathingScale2.stopAnimation();
    }
  }, [phase, isPaused, timerCircleAnim, breathingScale1, breathingScale2]);

  // Tick rest timer
  useEffect(() => {
    if (phase !== "rest" || isPaused) return;

    if (restTimer <= 0) {
      handleRestComplete();
      return;
    }

    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRestComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, restTimer, isPaused]);

  // Total elapsed time & Calorie counter
  useEffect(() => {
    if (phase === "complete" || isPaused) return;

    // Start pulsing/wobbling animation for the fire icon while active
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fireScaleAnim, { toValue: 1.25, duration: 300, useNativeDriver: true }),
          Animated.timing(fireScaleAnim, { toValue: 0.9, duration: 350, useNativeDriver: true }),
          Animated.timing(fireScaleAnim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
          Animated.timing(fireScaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(fireRotateAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(fireRotateAnim, { toValue: -1, duration: 600, useNativeDriver: true }),
          Animated.timing(fireRotateAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ])
    ).start();

    const interval = setInterval(() => {
      setTotalElapsed((t) => t + 1);
      
      const duration = getExerciseDuration(currentExercise);
      const expected = currentExercise?.expectedCalories || 10;
      const burnRatePerSecond = expected / duration;

      setCaloriesBurned((c) => +(c + burnRatePerSecond).toFixed(2)); 
    }, 1000);
    
    return () => {
      clearInterval(interval);
      fireScaleAnim.stopAnimation();
      fireRotateAnim.stopAnimation();
    };
  }, [phase, isPaused, fireScaleAnim, fireRotateAnim]);

  const fireRotationInterpolate = fireRotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-12deg', '12deg']
  });

  const animateTransition = useCallback(
    (cb: () => void) => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        cb();
        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [fadeAnim, slideAnim]
  );

  const handleNext = () => {
    if (phase === "rest") {
      setRestTimer(0);
      handleRestComplete();
      return;
    }

    if (!currentExercise) return;
    
    // Check if this is the last set of the last exercise
    if (currentIndex >= exercises.length - 1 && currentSet >= currentExercise.sets) {
      setPhase("complete");
      return;
    }

    animateTransition(() => {
      if (currentSet < currentExercise.sets) {
        setRestTimer(currentExercise.restSeconds || 60);
        setPhase("rest");
      } else {
        // We're on the last set of the current exercise
        setRestTimer(currentExercise.restSeconds || 60);
        setPhase("rest");
      }
    });
  };
  
  handleNextRef.current = handleNext;

  const handleRestComplete = () => {
    if (!currentExercise) return;
    Vibration.vibrate([0, 100, 50, 100]);

    if (currentSet < currentExercise.sets) {
      animateTransition(() => {
        setExerciseTimer(getExerciseDuration(currentExercise));
        setCurrentSet((s) => s + 1);
        setPhase("exercise");
      });
    } else {
      animateTransition(() => {
        const nextIdx = currentIndex + 1;
        setExerciseTimer(getExerciseDuration(exercises[nextIdx]));
        setCurrentIndex(nextIdx);
        setCurrentSet(1);
        setPhase("exercise");
      });
    }
  };

  const handlePrevious = () => {
    if (phase === "rest") {
      setExerciseTimer(getExerciseDuration(currentExercise));
      animateTransition(() => {
        setPhase("exercise");
      });
      return;
    }
    
    if (currentSet > 1) {
      setExerciseTimer(getExerciseDuration(currentExercise));
      animateTransition(() => setCurrentSet((s) => s - 1));
    } else if (currentIndex > 0) {
      const prevExercise = exercises[currentIndex - 1];
      setExerciseTimer(getExerciseDuration(prevExercise));
      animateTransition(() => {
        setCurrentIndex((i) => i - 1);
        setCurrentSet(prevExercise.sets);
        setPhase("exercise");
      });
    } else {
      // Re-start current if already at beginning
      setExerciseTimer(getExerciseDuration(currentExercise));
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!routine) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Routine not found.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={{flex: 1, backgroundColor: '#000000'}}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        
        {/* HYPE OVERLAY */}
        {showHypeOverlay && (
          <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 9999, opacity: hypeOpacity }]}>
            <BlurView intensity={120} experimentalBlurMethod="dimezisBlurView" tint="dark" style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
              <FadeTranslate order={0} translateYFrom={20}>
                <Text style={{ fontFamily: theme.black, fontSize: 44, fontWeight: "900", color: "#fff", textAlign: "center" }}>
                  Ready to Start?
                </Text>
                <Text style={{ fontFamily: theme.bold, fontSize: 18, color: D.primary, textAlign: "center", marginTop: 12 }}>
                  Let&apos;s get this workout!
                </Text>
              </FadeTranslate>
            </BlurView>
          </Animated.View>
        )}

        {/* TOP HEADER */}
        <FadeTranslate order={0} direction="y" translateYFrom={-20} style={[styles.topToggleRow, { justifyContent: 'flex-start', paddingHorizontal: 24, gap: 16 }]}>
           <Pressable onPress={() => router.back()} style={{ zIndex: 10 }}>
              <Ionicons name="chevron-down" size={32} color="#fff" />
           </Pressable>
           
           <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
             {/* TIMER on left */}
             <View style={[styles.toggleActive, { paddingHorizontal: 16, paddingVertical: 8, height: 'auto', borderRadius: 20 }]}>
                 <Text style={[styles.toggleTextActive, { fontSize: 16, fontWeight: '700' }]}>{formatTime(exerciseTimer)}</Text>
             </View>

             {/* PROGRESS BAR beside timer */}
             <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                 {exercises.map((_, i) => {
                    if (i === 0) return null;
                    return (
                      <View key={i} style={{
                         position: 'absolute',
                         left: `${(i / totalExercises) * 100}%`,
                         width: 2, height: '100%',
                         backgroundColor: '#000000',
                         zIndex: 2
                      }} />
                    )
                 })}
                 <Animated.View style={{ 
                     position: 'absolute', top: 0, bottom: 0, left: 0,
                     backgroundColor: D.primary,
                     width: progressWidth 
                 }} />
             </View>
           </View>
        </FadeTranslate>

        <Animated.View
          style={[
            styles.contentHost,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {phase === "complete" ? (
            <FadeTranslate order={0.5} style={styles.completeScreen}>
              <View style={styles.completeIconWrap}>
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: D.primary, opacity: 0.2, borderRadius: 100, transform: [{scale: 1.4}]}]} />
                  <View style={[StyleSheet.absoluteFillObject, { backgroundColor: D.primary, opacity: 0.1, borderRadius: 100, transform: [{scale: 1.8}]}]} />
                  <Ionicons name="trophy" size={60} color={D.bg} />
              </View>
              <Text style={styles.completeTitle}>Workout <Text style={{color: D.primary}}>Mastered!</Text></Text>
              <Text style={styles.completeSub}>Great job wrapping up {routine?.name}.</Text>
              <View style={styles.statsRow}>
                 <View style={styles.statBox}>
                     <View style={styles.statIconWrap}>
                         <Ionicons name="flash" size={24} color={D.primary} />
                     </View>
                     <View>
                       <Text style={styles.statVal}>{totalExercises}</Text>
                       <Text style={styles.statLbl}>Exercises</Text>
                     </View>
                 </View>
                 <View style={styles.statBox}>
                     <View style={[styles.statIconWrap, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                         <Ionicons name="time" size={24} color="#fff" />
                     </View>
                     <View>
                       <Text style={styles.statVal}>{formatTime(totalElapsed)}</Text>
                       <Text style={styles.statLbl}>Duration</Text>
                     </View>
                 </View>
              </View>

              <View style={{ width: 400, maxWidth: '100%', alignSelf: 'center', marginTop: 20 }}>
                <ButtonFit
                  title="Finish Workout"
                  backgroundColor={D.primary}
                  onPress={() => router.back()}
                />
              </View>
            </FadeTranslate>

          ) : phase === "rest" ? (
            (() => {
              let upNextExerName = currentExercise?.name;
              let upNextSetName = `Set ${currentSet + 1} of ${currentExercise?.sets}`;
              let upNextImage = currentExercise?.gifUrl;

              if (currentExercise && currentSet >= currentExercise.sets) {
                const nextExer = exercises[currentIndex + 1];
                if (nextExer) {
                  upNextExerName = nextExer.name;
                  upNextSetName = `Set 1 of ${nextExer.sets}`;
                  upNextImage = nextExer.gifUrl;
                } else {
                  upNextExerName = "Workout Complete";
                  upNextSetName = "";
                  upNextImage = null;
                }
              }

              return (
                <FadeTranslate order={0.2} delay={100} style={styles.restContainer}>
                  {socialProofVisible && (
                    <View style={styles.socialProofRow}>
                      <View style={styles.socialAvatarStack}>
                        {socialProofAvatars.map((idx, i) => (
                          <Image
                            key={idx}
                            source={AVATAR_POOL[idx]}
                            style={[styles.socialAvatar, i > 0 && { marginLeft: -10 }]}
                          />
                        ))}
                      </View>
                      <Text style={styles.socialProofText}>{socialProofMessage}</Text>
                    </View>
                  )}
                  <View style={styles.timerSection}>
                    <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
                      <Animated.View style={[styles.breathingCircle, { width: 300, height: 300, backgroundColor: D.primary, opacity: 0.1, transform: [{ scale: breathingScale2 }] }]} />
                      <Animated.View style={[styles.breathingCircle, { width: 350, height: 350, backgroundColor: D.primary, opacity: 0.15, transform: [{ scale: breathingScale1 }] }]} />
                    </View>
                    
                    <View style={styles.timerControlsRow}>
                      <Pressable onPress={() => setRestTimer((r) => Math.max(0, r - 10))} style={styles.timeAdjustBtn}>
                        <Ionicons name="remove" size={28} color={D.white} />
                      </Pressable>

                      <Animated.View style={[styles.timerValueCol, { transform: [{ scale: timerCircleAnim }] }]}>
                        <Text style={styles.timerValAnimated}>{formatTime(restTimer)}</Text>
                        <Text style={styles.timerLblAnimated}>Rest Remaining</Text>
                      </Animated.View>

                      <Pressable onPress={() => setRestTimer((r) => r + 10)} style={styles.timeAdjustBtn}>
                        <Ionicons name="add" size={28} color={D.white} />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.glowQuoteWrapper}>
                    <Text style={styles.glowQuoteText}>&quot;{currentQuote}&quot;</Text>  
                  </View>
                  <View style={styles.upNextContainer}>
                    <Text style={styles.upNextCardTitle}>UP NEXT</Text>
                    <View style={styles.upNextCardRow}>
                      {upNextImage ? (
                        <Image source={{ uri: upNextImage }} style={styles.upNextThumb} />
                      ) : (
                        <View style={[styles.upNextThumb, { backgroundColor: '#2C2C2E', alignItems: 'center', justifyContent: 'center' }]}>
                          <Ionicons name="barbell-outline" size={24} color="#1C1C1E" />
                        </View>
                      )}
                      <View style={styles.upNextCardInfo}>
                        <Text style={styles.upNextCardExer} numberOfLines={1}>{upNextExerName}</Text>
                        <Text style={styles.upNextCardSets}>{upNextSetName}</Text>
                      </View>
                      <Pressable style={styles.skipRestFab} onPress={handleNext}>
                        <Ionicons name="play" size={22} color={D.bg} />
                      </Pressable>
                    </View>
                  </View>
                </FadeTranslate>
              );
            })()
          ) : (
            currentExercise && (
              <FadeTranslate order={0.2} delay={100} style={{ flex: 1 }}>
              <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.ytContainer}>
                    {/* ARTWORK */}
                    <View style={styles.ytArtwork}>
                        {currentExercise.gifUrl ? (
                            <Image 
                               source={{ uri: currentExercise.gifUrl }} 
                               style={StyleSheet.absoluteFillObject}
                               resizeMode="cover"
                            />
                        ) : (
                            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "transparent", alignItems: "center", justifyContent: "center" }]}>
                                <Ionicons name="barbell-outline" size={100} color="#000000" />
                            </View>
                        )}
                    </View>

                    <View style={styles.ytLowerHalf}>
                        {/* REAL-TIME GAMIFIED CALORIES DISPLAY (MOVED BELOW IMAGE) */}
                        <View style={styles.caloriesBannerContainer}>
                            <Animated.View style={{ transform: [{ scale: fireScaleAnim }, { rotate: fireRotationInterpolate }] }}>
                                <Ionicons name="flame" size={24} color="#ff4000" />
                            </Animated.View>
                            <Text style={styles.caloriesBannerText}>
                                {Math.floor(caloriesBurned)} 
                                <Text style={{fontSize: 16, color: 'rgba(255,255,255,0.7)', fontFamily: theme.medium}}> cal burned</Text>
                            </Text>
                        </View>

                        {/* TITLE ROW */}
                        <View style={styles.ytTitleRow}>
                            <View style={styles.ytTitleCenter}>
                                <Text style={styles.ytTitle} numberOfLines={2}>{currentExercise.name}</Text>
                                <Text style={styles.ytSubtitle} numberOfLines={1}>{currentExercise.category} • Set {currentSet} of {currentExercise.sets}</Text>
                            </View>
                            <Pressable onPress={handleToggleLike} style={styles.heartButton}>
                                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? "#ff4000" : "#fff"} />
                            </Pressable>
                        </View>

                        {/* CONTROLS */}
                        <View style={styles.ytControlsRow}>
                            <Pressable onPress={handlePrevious} disabled={currentIndex === 0 && currentSet === 1} style={styles.controlButton}>
                                 <Ionicons name="play-skip-back" size={42} color={(currentIndex === 0 && currentSet === 1) ? "rgba(255,255,255,0.3)" : "#fff"} />
                            </Pressable>
                            
                            <Pressable style={styles.ytPlayPause} onPress={() => setIsPaused(!isPaused)}>
                                 <Ionicons name={isPaused ? "play" : "pause"} size={48} color="#000" />
                            </Pressable>

                            <Pressable onPress={handleNext} style={styles.controlButton}>
                                 <Ionicons name="play-skip-forward" size={42} color="#fff" />
                            </Pressable>
                        </View>

                        {/* BOTTOM TABS / GUIDE LINK */}
                        <View style={styles.ytBottomTabs}>
                            <Pressable onPress={() => handleOpenSheet("upNext")} style={styles.ytBottomTabCenter}>
                               <Ionicons name="list" size={24} color="rgba(255,255,255,0.6)" style={{ marginBottom: 4 }} />
                               <Text style={styles.ytBottomTab}>Up Next</Text>
                            </Pressable>
                            <View style={styles.ytBottomTabCenter}>
                               <Ionicons name="book" size={24} color="#fff" style={{ marginBottom: 4 }} />
                               <Text style={[styles.ytBottomTab, { color: '#fff', fontFamily: theme.bold }]}>Guide</Text>
                               <View style={styles.ytBottomTabIndicator} />
                            </View>
                            <Pressable style={styles.ytBottomTabCenter}>
                               <Ionicons name="information-circle" size={24} color="rgba(255,255,255,0.6)" style={{ marginBottom: 4 }} />
                               <Text style={styles.ytBottomTab}>Details</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* INLINE GUIDE BELOW THE PLAYER */}
                <View style={styles.inlineGuideContainer}>
                  <Text style={styles.sheetTitle}>Execution Guide</Text>
                  {infoLoading ? (
                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                      <Text style={styles.sheetDescText}>Loading...</Text>
                    </View>
                  ) : exerciseInfo?.instructions?.length ? (
                    exerciseInfo.instructions.map((step, i) => {
                      let cleaned = step.replace(/^step\s*[:.-]?\s*\d+\s*[:.-]?\s*/i, "").trim();
                      if (cleaned.length > 0) cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
                      return (
                        <View key={i} style={styles.stepRow}>
                          <View style={styles.stepLineContainer}>
                            <View style={styles.stepNumberWrap}>
                              <Text style={styles.stepNumber}>{i + 1}</Text>
                            </View>
                            {i !== (exerciseInfo.instructions.length - 1) && (
                              <View style={styles.stepLine} />
                            )}
                          </View>
                          <View style={styles.stepTextContainer}>
                            <Text style={styles.stepText}>{cleaned}</Text>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.sheetDescText}>
                      {currentExercise.description || "Do " + currentExercise.name + " for " + currentExercise.sets + " sets. Focus on proper form and controlled movements."}
                    </Text>
                  )}
                </View>
              </ScrollView>
              </FadeTranslate>
            )
          )}
        </Animated.View>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={["50%", "90%"]}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: D.cardAlt }}
          handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
          onChange={(index) => {
            if (index === -1) setActiveSheet(null);
          }}
        >
          <BottomSheetScrollView 
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            {activeSheet === "upNext" && (
              <View>
                <Text style={styles.sheetTitle}>Up Next in Route</Text>
                {exercises.slice(currentIndex + 1).map((ex, i) => (
                  <View key={i} style={styles.sheetExerciseRow}>
                    <View style={styles.sheetExerInfo}>
                      <Text style={styles.sheetExerName}>{ex.name}</Text>
                      <Text style={styles.sheetExerSets}>{ex.sets} Sets</Text>
                    </View>
                  </View>
                ))}
                {exercises.slice(currentIndex + 1).length === 0 && (
                  <Text style={styles.sheetEmptyText}>No more exercises in this routine.</Text>
                )}
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: D.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: D.white,
    fontSize: 18,
    fontFamily: theme.semibold,
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: D.cardAlt,
    borderRadius: 12,
  },
  backBtnText: {
    color: D.white,
    fontFamily: theme.semibold,
  },
  container: {
    flex: 1,
  },
  topToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    position: 'relative',
    height: 40,
  },
  topToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    padding: 3,
  },
  toggleActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  toggleInactive: {
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  toggleTextActive: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 14,
  },
  toggleTextInactive: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: theme.semibold,
    fontSize: 14,
  },
  contentHost: {
    flex: 1,
  },
  
  // YT Music Player Styles
  ytContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  ytArtwork: {
    width: 400,
    maxWidth: '100%',
    alignSelf: 'center',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginTop: 10,
  },
  ytLowerHalf: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  ytTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 35,
    width: 430,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  caloriesBannerContainer: {
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#1C1C1E', // solid modern sleek
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  caloriesBannerText: {
    color: '#fff',
    fontFamily: theme.bold,
    fontSize: 20,
    letterSpacing: 0.5,
  },
  ytTitleCenter: {
    flex: 1,
    alignItems: 'flex-start',
    marginHorizontal: 8,
  },
  ytTitle: {
    color: '#fff',
    fontSize: 28,
    fontFamily: theme.bold,
    marginBottom: 8,
    lineHeight: 34,
  },
  ytSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontFamily: theme.medium,
  },
  heartButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ytControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 50,
    width: 400,
    maxWidth: '100%',
    alignSelf: 'center',
    gap: 40,
  },
  controlButton: {
    padding: 12,
  },
  ytPlayPause: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ytBottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    paddingTop: 10,
    paddingBottom: 25,
  },
  ytBottomTabCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  ytBottomTabIndicator: {
    width: 24,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 4,
    position: 'absolute',
    bottom: -10,
  },
  ytBottomTab: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: theme.medium,
  },
  
  // INLINE GUIDE STYLES
  inlineGuideContainer: {
    paddingHorizontal: 24,
    paddingTop: 30, // Brought up
    paddingBottom: 60,
    backgroundColor: D.cardAlt,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -10, // Bring it exactly below the tabs or slightly overlay
  },
  sheetTitle: {
    color: D.white,
    fontFamily: theme.bold,
    fontSize: 22,
    marginBottom: 30,
  },
  sheetDescText: {
    color: D.textRef,
    fontFamily: theme.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepLineContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 32,
  },
  stepNumberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: D.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepNumber: {
    color: D.bg,
    fontFamily: theme.bold,
    fontSize: 14,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(170, 251, 5, 0.3)',
    marginTop: 4,
    marginBottom: -16,
  },
  stepTextContainer: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 16,
  },
  stepText: {
    color: D.white,
    fontFamily: theme.medium,
    fontSize: 16,
    lineHeight: 24,
  },

  // New Rest Screen Styles
  restContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  timerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  timerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    zIndex: 10,
  },
  timeAdjustBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerValueCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
  },
  timerValAnimated: {
    color: D.primary,
    fontFamily: theme.bold,
    fontSize: 72,
    lineHeight: 80,
    textShadowColor: 'rgba(170, 251, 5, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  timerLblAnimated: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: theme.bold,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  glowQuoteWrapper: {
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 60,
    paddingBottom: 8,
  },
  upNextContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quoteIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: D.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  socialProofRow: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  socialAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: D.bg,
  },
  socialProofText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontFamily: theme.medium,
    flexShrink: 1,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  glowQuoteText: {
    color: D.white,
    fontFamily: theme.medium,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    opacity: 0.75,
    marginBottom: 20,
  },
  upNextCard: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  upNextCardTitle: {
    color: D.textRef,
    fontFamily: theme.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  upNextCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 400,
    maxWidth: '100%',
    alignSelf: 'center',
  },
  upNextThumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginRight: 16,
    backgroundColor: '#1C1C1E',
  },
  upNextCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  upNextCardExer: {
    color: D.white,
    fontFamily: theme.bold,
    fontSize: 18,
    marginBottom: 4,
  },
  upNextCardSets: {
    color: D.primary,
    fontFamily: theme.medium,
    fontSize: 14,
  },
  skipRestFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: D.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  completeScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  completeIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: D.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  completeTitle: {
    color: D.white,
    fontFamily: theme.bold,
    fontSize: 32,
    textAlign: "center",
    marginBottom: 12,
  },
  completeSub: {
    color: D.textRef,
    fontFamily: theme.medium,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    marginBottom: 40,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#151515',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2E',
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(170,251,5,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statVal: {
    color: D.white,
    fontFamily: theme.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  statLbl: {
    color: D.textRef,
    fontFamily: theme.medium,
    fontSize: 13,
  },
  sheetContent: {
    padding: 24,
  },
  sheetExerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: D.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sheetExerInfo: {
    flex: 1,
  },
  sheetExerName: {
    color: D.white,
    fontSize: 16,
    fontFamily: theme.semibold,
    marginBottom: 4,
  },
  sheetExerSets: {
    color: D.primary,
    fontSize: 14,
    fontFamily: theme.medium,
  },
  sheetEmptyText: {
    color: D.textRef,
    fontSize: 16,
    fontFamily: theme.medium,
    textAlign: "center",
    marginTop: 20,
  },
  breathingCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
});
