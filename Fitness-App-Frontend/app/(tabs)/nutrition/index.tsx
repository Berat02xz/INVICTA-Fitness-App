import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { GetUserDetails } from "@/api/UserDataEndpoint";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import Svg, { Circle } from "react-native-svg";
import FadeTranslate from "@/components/ui/FadeTranslate";
import ConfettiCannon from "react-native-confetti-cannon";

// ─── Design tokens ────────────────────────────────────────────────────────────
const D = {
  bg:      "#141414",
  card:    "#1C1C1E",
  card2:   "#242426",
  border:  "#2C2C2E",
  primary: theme.primary,         // #AAFB05 lime
  primaryDim: "rgba(170,251,5,0.12)",
  text:    "#FFFFFF",
  sub:     "#8E8E93",
  muted:   "#3A3A3C",
  protein: "#4E9FFF",
  carbs:   "#FFB340",
  fats:    "#34C759",
};

const DEFAULT_MACRO_SPLIT = { protein: 0.3, carbs: 0.4, fats: 0.3 } as const;

function clamp01(v: number) {
  if (!isFinite(v) || isNaN(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

// ─── Circular ring ────────────────────────────────────────────────────────────
function Ring({
  progress, size, stroke, color, children,
}: {
  progress: number; size: number; stroke: number; color: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = clamp01(progress);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={r} stroke={D.border} strokeWidth={stroke} fill="transparent" />
        {p > 0 && (
          <Circle
            cx={size/2} cy={size/2} r={r}
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={circ * (1 - p)}
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />
        )}
      </Svg>
      {children && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>{children}</View>
        </View>
      )}
    </View>
  );
}

// ─── Thin progress bar ────────────────────────────────────────────────────────
function Bar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={barSt.track}>
      <View style={[barSt.fill, { width: `${Math.min(clamp01(progress)*100,100)}%` as any, backgroundColor: color }]} />
    </View>
  );
}
const barSt = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: D.border, overflow: "hidden" },
  fill:  { height: 4, borderRadius: 2 },
});

export default function NutritionScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekSuccessData, setWeekSuccessData] = useState<boolean[]>([]);
  const isSuccessfulDay = weekSuccessData[new Date().getDay()] ?? false;

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
      await fetchWeekSuccessData(userId!);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekSuccessData = async (userId: string) => {
    try {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      const data: boolean[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        data.push(await Meal.DaySuccesfulCalorieIntake(database, userId, d));
      }
      setWeekSuccessData(data);
    } catch {
      setWeekSuccessData(Array(7).fill(false));
    }
  };

  const getWeekDays = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        dayName:   d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        dayNumber: d.getDate(),
        isToday:   d.toDateString() === today.toDateString(),
        isFuture:  d > today,
      };
    });
  };

  const getStreak = () => {
    const todayIdx = new Date().getDay();
    let streak = 0;
    for (let i = todayIdx; i >= 0; i--) {
      if (weekSuccessData[i]) streak++;
      else break;
    }
    return streak;
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const getMealAccent = (index: number) => {
    const accents = [D.protein, D.carbs, D.fats, "#FF6B6B", "#C77DFF"];
    return accents[index % accents.length];
  };

  const totals = todayMeals.reduce(
    (a, m) => ({ calories: a.calories + m.calories, protein: a.protein + m.protein, carbs: a.carbs + m.carbohydrates, fats: a.fats + m.fats }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const targetCalories = userData?.caloricIntake || 2000;
  const caloriesLeft   = Math.max(0, Math.round(targetCalories - totals.calories));
  const calPct         = clamp01(totals.calories / targetCalories);

  const proteinTarget = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.protein) / 4);
  const carbsTarget   = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.carbs) / 4);
  const fatsTarget    = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.fats) / 9);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const streak = getStreak();

  const motivationLabel = () => {
    if (totals.calories === 0) return "Start logging your meals!";
    if (calPct >= 1.2)         return "Over your limit — dial it back 💪";
    if (calPct >= 0.9)         return "Almost at your goal!";
    if (calPct >= 0.6)         return "You're crushing it!";
    return "Keep going, you've got this!";
  };

  if (loading) {
    return (
      <View style={[s.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: D.sub, fontFamily: theme.medium }}>Loading…</Text>
      </View>
    );
  }

  const weekDays = getWeekDays();

  return (
    <View style={s.container}>
      {isSuccessfulDay && <ConfettiCannon count={12} origin={{ x: -10, y: 0 }} />}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.headerSpace} />

        {/* ── Header ── */}
        <FadeTranslate order={0}>
          <View style={s.header}>
            <Text style={s.headerDate}>{dateLabel.toUpperCase()}</Text>
            <Text style={s.headerTitle}>Nutrition</Text>
          </View>
        </FadeTranslate>

        {/* ── Stats strip  (lime icon circles, like reference) ── */}
        <FadeTranslate order={1}>
          <View style={s.statsRow}>
            <View style={s.statTile}>
              <View style={s.statIconCircle}>
                <Ionicons name="flame" size={18} color={D.primary} />
              </View>
              <Text style={s.statValue}>{streak}</Text>
              <Text style={s.statLabel}>Day streak</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statTile}>
              <View style={s.statIconCircle}>
                <Ionicons name="restaurant" size={17} color={D.primary} />
              </View>
              <Text style={s.statValue}>{todayMeals.length}</Text>
              <Text style={s.statLabel}>Meals today</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statTile}>
              <View style={s.statIconCircle}>
                <Ionicons name="trophy" size={17} color={D.primary} />
              </View>
              <Text style={s.statValue}>{Math.round(calPct * 100)}%</Text>
              <Text style={s.statLabel}>Goal hit</Text>
            </View>
          </View>
        </FadeTranslate>

        {/* ── Weekly calendar (individual card cells, like reference) ── */}
        <FadeTranslate order={2}>
          <View style={s.calendarRow}>
            {weekDays.map((day, i) => {
              const isSuccess = weekSuccessData[i];
              const isToday   = day.isToday;
              const isFuture  = day.isFuture;
              return (
                <View
                  key={i}
                  style={[
                    s.calDayCard,
                    isToday   && s.calDayCardToday,
                    isSuccess && !isToday && s.calDayCardSuccess,
                    isFuture  && s.calDayCardFuture,
                  ]}
                >
                  {/* dots above day number */}
                  <View style={s.dotsRow}>
                    {isSuccess ? (
                      <>
                        <View style={[s.dot, s.dotActive]} />
                        <View style={[s.dot, s.dotActive]} />
                        <View style={[s.dot, s.dotActive]} />
                      </>
                    ) : isToday ? (
                      <>
                        <View style={[s.dot, s.dotActive]} />
                        <View style={[s.dot, s.dotActive]} />
                        <View style={[s.dot, s.dotActive]} />
                      </>
                    ) : (
                      <View style={[s.dot, { backgroundColor: isFuture ? "transparent" : D.muted }]} />
                    )}
                  </View>
                  <Text style={[s.calDayName, isToday && s.calDayNameToday, isFuture && s.calTextFuture]}>
                    {day.dayName.slice(0, 3)}
                  </Text>
                  <Text style={[s.calDayNum, isToday && s.calDayNumToday, isFuture && s.calTextFuture]}>
                    {day.dayNumber}
                  </Text>
                </View>
              );
            })}
          </View>
        </FadeTranslate>

        {/* ── "Keep it up!" progress banner (reference style: 3-zone horizontal) ── */}
        <FadeTranslate order={3}>
          <View style={s.keepCard}>
            {/* Left zone: ring visual */}
            <View style={s.keepLeft}>
              <Ring progress={calPct} size={86} stroke={8} color={D.primary}>
                <Ionicons name="flame" size={22} color={D.primary} />
              </Ring>
              <Text style={s.keepCalNum}>{Math.round(totals.calories)}</Text>
              <Text style={s.keepCalSub}>kcal eaten</Text>
            </View>

            {/* Center zone: motivation text + dots */}
            <View style={s.keepCenter}>
              <Text style={s.keepTitle}>Keep it up!</Text>
              <Text style={s.keepSub}>
                {streak > 0
                  ? `${streak} day${streak > 1 ? "s" : ""} in a row!`
                  : motivationLabel()}
              </Text>
              <Text style={s.keepRemain}>
                <Text style={s.keepRemainBig}>{caloriesLeft}</Text>
                {" "}kcal left
              </Text>
              {/* Progress dots */}
              <View style={s.keepDots}>
                {Array.from({ length: 8 }, (_, i) => {
                  const filled = i < Math.round(calPct * 8);
                  return (
                    <View
                      key={i}
                      style={[
                        s.keepDot,
                        filled ? s.keepDotFilled : null,
                        i === Math.round(calPct * 8) - 1 && filled ? s.keepDotCurrent : null,
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            {/* Right zone: large lime trophy icon bleeding off edge */}
            <View style={s.keepRight}>
              <View style={s.keepTrophyWrap}>
                <Ionicons name="trophy" size={72} color={D.primary} style={{ opacity: 0.9 }} />
              </View>
            </View>
          </View>
        </FadeTranslate>

        {/* ── Macros card ── */}
        <FadeTranslate order={4}>
          <View style={s.macrosCard}>
            <View style={s.macroItem}>
              <View style={s.macroLabelRow}>
                <View style={[s.macroDot, { backgroundColor: D.protein }]} />
                <Text style={s.macroName}>Protein</Text>
                <Text style={s.macroVal}>{Math.round(totals.protein)}<Text style={s.macroG}>g</Text></Text>
              </View>
              <Bar progress={proteinTarget > 0 ? totals.protein / proteinTarget : 0} color={D.protein} />
              <Text style={s.macroTarget}>{proteinTarget}g goal</Text>
            </View>
            <View style={s.macroDivider} />
            <View style={s.macroItem}>
              <View style={s.macroLabelRow}>
                <View style={[s.macroDot, { backgroundColor: D.carbs }]} />
                <Text style={s.macroName}>Carbs</Text>
                <Text style={s.macroVal}>{Math.round(totals.carbs)}<Text style={s.macroG}>g</Text></Text>
              </View>
              <Bar progress={carbsTarget > 0 ? totals.carbs / carbsTarget : 0} color={D.carbs} />
              <Text style={s.macroTarget}>{carbsTarget}g goal</Text>
            </View>
            <View style={s.macroDivider} />
            <View style={s.macroItem}>
              <View style={s.macroLabelRow}>
                <View style={[s.macroDot, { backgroundColor: D.fats }]} />
                <Text style={s.macroName}>Fat</Text>
                <Text style={s.macroVal}>{Math.round(totals.fats)}<Text style={s.macroG}>g</Text></Text>
              </View>
              <Bar progress={fatsTarget > 0 ? totals.fats / fatsTarget : 0} color={D.fats} />
              <Text style={s.macroTarget}>{fatsTarget}g goal</Text>
            </View>
          </View>
        </FadeTranslate>

        {/* ── Primary CTA: Full lime "Scan" card (like reference's lime card) ── */}
        <FadeTranslate order={5}>
          <TouchableOpacity
            style={s.scanCard}
            onPress={() => router.push("../(screens)/ScanMeal")}
            activeOpacity={0.82}
          >
            {/* Big icon bleeding left edge */}
            <View style={s.scanIconWrap}>
              <Ionicons name="scan-circle" size={100} color="rgba(0,0,0,0.18)" />
            </View>
            <View style={s.scanTextCol}>
              <Text style={s.scanTitle}>Scan your meal</Text>
              <Text style={s.scanSub}>Snap a photo to instantly log macros & calories</Text>
              <View style={s.scanBtn}>
                <Text style={s.scanBtnText}>Open Camera</Text>
                <Ionicons name="arrow-forward" size={14} color={D.primary} />
              </View>
            </View>
          </TouchableOpacity>
        </FadeTranslate>

        {/* ── Secondary: Search food pill ── */}
        <FadeTranslate order={6}>
          <TouchableOpacity style={s.searchCard} activeOpacity={0.8}>
            <View style={s.searchLeft}>
              <View style={s.searchIconCircle}>
                <Ionicons name="search" size={18} color={D.primary} />
              </View>
              <View>
                <Text style={s.searchTitle}>Search food</Text>
                <Text style={s.searchSub}>Find any food and log it manually</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={D.sub} />
          </TouchableOpacity>
        </FadeTranslate>

        {/* ── Today's meals ── */}
        {todayMeals.length > 0 && (
          <FadeTranslate order={7}>
            <View style={s.mealsSectionHeader}>
              <Text style={s.sectionLabel}>TODAY'S MEALS</Text>
              <View style={s.totalPill}>
                <Text style={s.totalPillText}>{Math.round(totals.calories)} kcal total</Text>
              </View>
            </View>
            <View style={s.mealsContainer}>
              {todayMeals.map((meal, i) => (
                <View key={meal.id} style={s.mealRow}>
                  <View style={[s.mealStripe, { backgroundColor: getMealAccent(i) }]} />
                  <View style={s.mealIconCircle}>
                    <Text style={s.mealEmoji}>{meal.oneEmoji ?? "🍽️"}</Text>
                  </View>
                  <View style={s.mealInfo}>
                    <Text style={s.mealName} numberOfLines={1}>{meal.mealName}</Text>
                    <Text style={s.mealMacros}>
                      P {Math.round(meal.protein)}g · C {Math.round(meal.carbohydrates)}g · F {Math.round(meal.fats)}g
                    </Text>
                  </View>
                  <View style={s.mealRight}>
                    <Text style={s.mealCal}>{meal.calories}</Text>
                    <Text style={s.mealCalUnit}>kcal</Text>
                    <Text style={s.mealTime}>{formatTime(meal.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </FadeTranslate>
        )}

        {todayMeals.length === 0 && (
          <FadeTranslate order={7}>
            <View style={s.emptyCard}>
              <Ionicons name="restaurant-outline" size={38} color={D.muted} />
              <Text style={s.emptyTitle}>No meals logged yet</Text>
              <Text style={s.emptySub}>Use Scan or Search above to start logging.</Text>
            </View>
          </FadeTranslate>
        )}

        <View style={s.bottomPad} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Scaffold
  container:     { flex: 1, backgroundColor: D.bg },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  headerSpace:   { height: 16 },
  bottomPad:     { height: 80 },

  // Header
  header:      { marginBottom: 18, marginTop: 4 },
  headerDate:  { fontSize: 11, fontFamily: theme.semibold, color: D.sub, letterSpacing: 1.2, marginBottom: 2 },
  headerTitle: { fontSize: 34, fontFamily: theme.black, color: D.text, letterSpacing: -0.8 },

  // ── Stats strip ──────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    backgroundColor: D.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: D.border,
    paddingVertical: 18,
    marginBottom: 12,
  },
  statTile:       { flex: 1, alignItems: "center", gap: 4 },
  statDivider:    { width: 1, backgroundColor: D.border },
  statIconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: D.primaryDim,
    alignItems: "center", justifyContent: "center",
    marginBottom: 2,
  },
  statValue: { fontSize: 20, fontFamily: theme.black, color: D.text, letterSpacing: -0.6 },
  statLabel: { fontSize: 11, fontFamily: theme.medium, color: D.sub },

  // ── Calendar (individual cards like reference) ───────────────────────────
  calendarRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 12,
  },
  calDayCard: {
    flex: 1,
    backgroundColor: D.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: D.border,
    alignItems: "center",
    paddingVertical: 10,
    gap: 3,
  },
  calDayCardToday:   { borderColor: D.primary, backgroundColor: D.primaryDim },
  calDayCardSuccess: { borderColor: D.fats,    backgroundColor: "rgba(52,199,89,0.10)" },
  calDayCardFuture:  { opacity: 0.35 },
  dotsRow:   { flexDirection: "row", gap: 2, height: 7, alignItems: "center", marginBottom: 1 },
  dot:       { width: 4, height: 4, borderRadius: 2, backgroundColor: D.muted },
  dotActive: { backgroundColor: D.primary },
  calDayName:     { fontSize: 9,  fontFamily: theme.semibold, color: D.sub, textTransform: "uppercase", letterSpacing: 0.3 },
  calDayNameToday:{ color: D.primary },
  calDayNum:      { fontSize: 15, fontFamily: theme.bold, color: D.text },
  calDayNumToday: { color: D.primary },
  calTextFuture:  { color: D.muted },

  // ── "Keep it up" banner (3-zone, like reference) ─────────────────────────
  keepCard: {
    flexDirection: "row",
    backgroundColor: D.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: D.border,
    marginBottom: 12,
    overflow: "hidden",
    minHeight: 148,
  },
  keepLeft: {
    width: 110,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 18,
    paddingLeft: 14,
    borderRightWidth: 1,
    borderRightColor: D.border,
  },
  keepCalNum:  { fontSize: 22, fontFamily: theme.black, color: D.primary, letterSpacing: -0.8 },
  keepCalSub:  { fontSize: 10, fontFamily: theme.medium, color: D.sub },
  keepCenter:  { flex: 1, justifyContent: "center", paddingHorizontal: 16, gap: 5 },
  keepTitle:   { fontSize: 18, fontFamily: theme.black, color: D.text, letterSpacing: -0.4 },
  keepSub:     { fontSize: 12, fontFamily: theme.medium, color: D.sub, lineHeight: 17 },
  keepRemain:  { fontSize: 12, fontFamily: theme.medium, color: D.sub },
  keepRemainBig: { fontSize: 16, fontFamily: theme.bold, color: D.primary },
  keepDots:    { flexDirection: "row", gap: 5, alignItems: "center", marginTop: 2 },
  keepDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: D.muted },
  keepDotFilled:  { backgroundColor: D.primary },
  keepDotCurrent: {
    width: 20, height: 7, borderRadius: 4,
    backgroundColor: D.primary,
  },
  keepRight: {
    width: 72,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  keepTrophyWrap: {
    marginBottom: -8,
    marginRight: -12,
  },

  // ── Macros card ───────────────────────────────────────────────────────────
  macrosCard: {
    flexDirection: "row",
    backgroundColor: D.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: D.border,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  macroItem:     { flex: 1 },
  macroDivider:  { width: 1, backgroundColor: D.border, marginHorizontal: 12 },
  macroLabelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
  macroDot:      { width: 7, height: 7, borderRadius: 4 },
  macroName:     { flex: 1, fontSize: 10, fontFamily: theme.semibold, color: D.sub, textTransform: "uppercase", letterSpacing: 0.5 },
  macroVal:      { fontSize: 15, fontFamily: theme.bold, color: D.text, letterSpacing: -0.3 },
  macroG:        { fontSize: 11, fontFamily: theme.regular, color: D.sub },
  macroTarget:   { fontSize: 10, fontFamily: theme.regular, color: D.muted, marginTop: 5 },

  // ── Full lime "Scan" card (like reference's lime CTA card) ────────────────
  scanCard: {
    backgroundColor: D.primary,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 10,
    minHeight: 130,
  },
  scanIconWrap: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
    alignSelf: "stretch",
  },
  scanTextCol:  { flex: 1, paddingVertical: 22, paddingRight: 18, gap: 6 },
  scanTitle:    { fontSize: 20, fontFamily: theme.black, color: "#000000", letterSpacing: -0.5 },
  scanSub:      { fontSize: 12, fontFamily: theme.medium, color: "rgba(0,0,0,0.55)", lineHeight: 17 },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#000000",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  scanBtnText: { fontSize: 13, fontFamily: theme.semibold, color: D.primary },

  // ── Secondary search card ─────────────────────────────────────────────────
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: D.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: D.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 22,
  },
  searchLeft:       { flexDirection: "row", alignItems: "center", gap: 14 },
  searchIconCircle: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: D.primaryDim,
    alignItems: "center", justifyContent: "center",
  },
  searchTitle: { fontSize: 15, fontFamily: theme.semibold, color: D.text },
  searchSub:   { fontSize: 12, fontFamily: theme.regular, color: D.sub, marginTop: 1 },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontFamily: theme.semibold,
    color: D.sub,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 2,
  },

  // ── Meals section header + list ───────────────────────────────────────────
  mealsSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  totalPill: {
    backgroundColor: D.card2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: D.border,
  },
  totalPillText: { fontSize: 11, fontFamily: theme.medium, color: D.primary },

  mealsContainer: { gap: 8, marginBottom: 10 },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: D.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: D.border,
    paddingRight: 14,
    paddingVertical: 12,
    overflow: "hidden",
  },
  mealStripe:     { width: 3, height: "100%", marginRight: 12 },
  mealIconCircle: { width: 42, height: 42, borderRadius: 12, backgroundColor: D.card2, alignItems: "center", justifyContent: "center", marginRight: 12 },
  mealEmoji:   { fontSize: 20 },
  mealInfo:    { flex: 1 },
  mealName:    { fontSize: 14, fontFamily: theme.semibold, color: D.text, marginBottom: 3 },
  mealMacros:  { fontSize: 11, fontFamily: theme.regular, color: D.sub },
  mealRight:   { alignItems: "flex-end" },
  mealCal:     { fontSize: 16, fontFamily: theme.bold, color: D.primary, letterSpacing: -0.3 },
  mealCalUnit: { fontSize: 10, fontFamily: theme.regular, color: D.sub },
  mealTime:    { fontSize: 10, fontFamily: theme.regular, color: D.muted, marginTop: 2 },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: D.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: D.border,
    padding: 32,
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 15, fontFamily: theme.semibold, color: D.text },
  emptySub:   { fontSize: 12, fontFamily: theme.regular, color: D.sub, textAlign: "center", lineHeight: 18 },
});


