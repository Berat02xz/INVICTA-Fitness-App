import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import database from "@/database/database";
import { User } from "@/models/User";
import { Meal } from "@/models/Meals";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import { Image } from "react-native";
import FadeTranslate from "@/components/ui/FadeTranslate";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

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

const MAX_LEVEL = 50;

const AVATARS = [
  require("@/assets/avatars/avatar1.jpg"),
  require("@/assets/avatars/avatar2.jpg"),
  require("@/assets/avatars/avatar3.jpg"),
  require("@/assets/avatars/avatar4.jpg"),
  require("@/assets/avatars/avatar5.jpg"),
  require("@/assets/avatars/avatar6.jpg"),
  require("@/assets/avatars/avatar7.jpg"),
];

const getFakeUsersForStreak = (streakNum: number) => {
  // Exponential decay type logic: lower numbers for higher streaks
  const baseFactor = Math.max(1, Math.floor(80000 / Math.pow(streakNum, 1.4)));
  // Add some randomness
  const count = Math.floor(baseFactor * (0.8 + 0.4 * Math.random()));
  
  if (count === 0) return null;
  
  const startIdx = (streakNum * 7) % AVATARS.length;
  const displayAvatars = [];
  displayAvatars.push(AVATARS[startIdx]);
  if (count > 1) displayAvatars.push(AVATARS[(startIdx + 1) % AVATARS.length]);
  if (count > 2) displayAvatars.push(AVATARS[(startIdx + 2) % AVATARS.length]);
  
  // Custom shorthand for large numbers (e.g. 50000 -> 50k)
  const formattedTotal = count >= 1000 ? (count / 1000).toFixed(1) + "k" : count;

  return { avatars: displayAvatars, total: count, formattedTotal };
};

export default function Roadmap() {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<User | null>(null);
  const [userStreak, setUserStreak] = useState(0);
  const [points, setPoints] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const user = await User.getUserDetails(database);
          if (active && user) setUserData(user);

          const userId = await getUserIdFromToken();
          if (!userId) return;

          // Streak calc logic
          const meals = await Meal.getTodayMeals(database, userId);
          const totalMeals = meals.length;

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

          for (let i = currentDay === 0 ? 6 : currentDay - 1; i >= 0; i--) {
            if (data[i]) s++;
            else if (i !== (currentDay === 0 ? 6 : currentDay - 1)) break;
          }

          if (active) {
            setUserStreak(s);
            setPoints(s * 150 + totalMeals * 10);
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

  // Generate milestone nodes
  const STREAK_MILESTONES = [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 120, 180, 250, 365];
  const nextMilestone = STREAK_MILESTONES.find(m => m > userStreak) || 365;
  const progressPercent = (userStreak / nextMilestone) * 100;
  const daysLeft = Math.max(0, nextMilestone - userStreak);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header */}
      <FadeTranslate order={0}>
        <View style={[s.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={s.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={D.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Journey Map</Text>
          <View style={s.ptsBadge}>
            <Text style={s.ptsEmoji}>🔥</Text>
            <Text style={s.ptsText}>{points} XP</Text>
          </View>
        </View>
      </FadeTranslate>

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FadeTranslate order={0.1}>
          <View style={s.heroCard}>
            <LinearGradient
              colors={["rgba(170,251,5,0.08)", "rgba(170,251,5,0.01)"]}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={s.heroIconWrap}>
              <Ionicons name="flame" size={40} color={D.primary} />
            </View>
            <Text style={s.heroTitle}>{userStreak} Day Streak</Text>
            <Text style={s.heroSub}>
              Goal: {userData?.goal || "Stay fit"}{"\n"}
              Calorie Target: {userData?.caloricIntake || 2000} kcal/day
            </Text>
            {userStreak < 365 && (
              <View style={s.progBarWrap}>
                 <View style={[s.progBarFill, { width: `${progressPercent}%` }]} />
                 <Text style={s.progBarText}>{daysLeft} days to {nextMilestone} Day Streak</Text>
              </View>
            )}
          </View>
        </FadeTranslate>

        {/* Roadmap Path */}
        <View style={s.roadmapContainer}>
          <View style={s.centerLine} />
          
          {STREAK_MILESTONES.map((milestone, i) => {
            const isCompleted = milestone <= userStreak;
            const isCurrent = milestone === nextMilestone;
            const isLocked = milestone > nextMilestone;
            const isLeft = i % 2 === 0;

            let bgColor = D.cardAlt;
            let borderColor = D.muted;
            let icon = "lock-closed";
            let iconColor = D.sub;

            if (isCompleted) {
              bgColor = D.primary;
              borderColor = D.primary;
              icon = "checkmark-outline";
              iconColor = "#000";
            } else if (isCurrent) {
              bgColor = "#000";
              borderColor = D.primary;
              icon = "flame";
              iconColor = D.primary;
            }

            return (
              <FadeTranslate 
                key={milestone} 
                order={0.2}
                delay={Math.min(i, 20) * 150}
              >
                <View 
                  style={[s.nodeWrapper, { flexDirection: isLeft ? "row" : "row-reverse" }]}
                >
                  {/* Text Side */}
                  <View style={[s.nodeSide, { alignItems: isLeft ? "flex-end" : "flex-start", paddingHorizontal: 16 }]}>
                  <Text style={[s.nodeLabel, isCompleted && s.nodeLabelCompleted, isCurrent && s.nodeLabelCurrent]}>
                    Day {milestone}
                  </Text>
                  {isCurrent && <Text style={s.nodeSubLabel}>Next Goal</Text>}
                </View>

                {/* Center Node */}
                <TouchableOpacity
                  style={[s.nodeItem, isCurrent && s.currentNodeScale]}
                  activeOpacity={0.9}
                >
                  <View style={[s.nodeCircle, { backgroundColor: bgColor, borderColor }]}>
                    <Ionicons name={icon as any} size={24} color={iconColor} />
                  </View>
                  {/* Glowing aura for current node */}
                  {isCurrent && (
                     <View style={s.nodeAura} />
                  )}
                </TouchableOpacity>

                {/* Users Side */}
                <View style={[s.nodeSide, { alignItems: isLeft ? "flex-start" : "flex-end", paddingHorizontal: 16 }]}>
                  {(() => {
                    const fakeData = getFakeUsersForStreak(milestone);
                    if (!fakeData && !isCurrent) return null;
                    return (
                      <View style={[s.usersBadge, { flexDirection: isLeft ? "row" : "row-reverse" }]}>
                        <View style={[s.avatarStack, { flexDirection: isLeft ? "row" : "row-reverse" }]}>
                          {fakeData?.avatars.map((av, idx) => (
                             <Image 
                                key={idx} 
                                source={av} 
                                style={[s.userAvatar, isLeft ? { marginLeft: idx > 0 ? -12 : 0 } : { marginRight: idx > 0 ? -12 : 0 }]} 
                             />
                          ))}
                        </View>
                        {fakeData && fakeData.total > fakeData.avatars.length && (
                             <View style={s.moreUsersPill}>
                                <Text style={s.moreUsersText}>+{fakeData.formattedTotal}</Text>
                             </View>
                        )}
                      </View>
                    )
                  })()}
                </View>
                </View>
              </FadeTranslate>
            );
          })}
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: D.muted,
    backgroundColor: D.bg,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: D.text,
    fontSize: 20,
    fontFamily: theme.bold,
  },
  ptsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6
  },
  ptsEmoji: {
    fontSize: 16,
  },
  ptsText: {
    color: D.text,
    fontFamily: theme.bold,
    fontSize: 14,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  heroCard: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    backgroundColor: D.card,
    borderWidth: 1,
    borderColor: D.border,
    alignItems: "center",
    overflow: "hidden",
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(170,251,5,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    color: D.text,
    fontSize: 32,
    fontFamily: theme.black,
    marginBottom: 8,
  },
  heroSub: {
    color: D.sub,
    fontSize: 15,
    fontFamily: theme.medium,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  progBarWrap: {
    width: "100%",
    height: 36,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
  },
  progBarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: D.primary,
    opacity: 0.3,
  },
  progBarText: {
    color: D.text,
    fontFamily: theme.semibold,
    fontSize: 13,
    textAlign: "center",
    zIndex: 1,
  },

  roadmapContainer: {
    paddingVertical: 20,
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  centerLine: {
    position: "absolute",
    top: 40,
    bottom: 40,
    width: 4,
    backgroundColor: D.border,
    borderRadius: 2,
    zIndex: 0,
  },
  nodeWrapper: {
    width: SCREEN_W,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    marginVertical: 10,
    zIndex: 1,
  },
  nodeSide: {
    width: (SCREEN_W / 2) - 40,
    justifyContent: "center",
  },
  nodeLabel: {
    color: D.sub,
    fontFamily: theme.bold,
    fontSize: 16,
  },
  nodeLabelCompleted: {
    color: "#fff",
  },
  nodeLabelCurrent: {
    color: D.primary,
    fontSize: 18,
  },
  nodeSubLabel: {
    color: "rgba(170,251,5,0.7)",
    fontFamily: theme.medium,
    fontSize: 12,
    marginTop: 4,
  },
  nodeItem: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  currentNodeScale: {
    transform: [{ scale: 1.15 }],
  },
  nodeAura: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: D.primary,
    borderRadius: 50,
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
    zIndex: -1,
  },
  nodeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: D.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  usersBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: D.bg,
    backgroundColor: D.muted,
  },
  moreUsersPill: {
    backgroundColor: D.cardAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: D.border,
  },
  moreUsersText: {
    color: D.sub,
    fontFamily: theme.bold,
    fontSize: 10,
  },
});
