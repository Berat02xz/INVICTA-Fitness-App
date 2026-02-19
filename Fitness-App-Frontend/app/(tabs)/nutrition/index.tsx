import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { GetUserDetails } from "@/api/UserDataEndpoint";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import FadeTranslate from "@/components/ui/FadeTranslate";
import ConfettiCannon from "react-native-confetti-cannon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UserDTO from "@/models/DTO/UserDTO";

// --- Design tokens ------------------------------------------------------------
const D = {
  bg:      "#000000",
  // Cards are now slightly lighter than BG but no borders
  card:    "#121212", 
  card2:   "#1C1C1E",
  // Removed global border usage for cards
  primary: "#AAFB05",
  primaryDim: "rgba(170,251,5,0.15)",
  text:    "#FFFFFF",
  sub:     "#888888",
  muted:   "#333333",
  protein: "#4E9FFF",
  carbs:   "#FFB340",
  fats:    "#34C759",
};

const DEFAULT_MACRO_SPLIT = { protein: 0.3, carbs: 0.4, fats: 0.3 };

function clamp01(v: number) {
  if (!isFinite(v) || isNaN(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

// --- Segmented Circular Progress ----------------------------------------------
function SegmentedCircularProgress({
  size,
  stroke,
  totals, 
  targetCalories,
  overrideColor,
  children
}: {
  size: number;
  stroke: number;
  totals: { calories: number, protein: number, carbs: number, fats: number };
  targetCalories: number;
  overrideColor?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  
  // Contributions
  const cP = totals.protein * 4;
  const cC = totals.carbs * 4;
  const cF = totals.fats * 9;
  const totalMacroCal = cP + cC + cF || 1; 

  // Progress (max 100%)
  const progressPct = Math.min(totals.calories / targetCalories, 1);
  const totalArcLen = circ * progressPct;

  // Ratios
  const pRatio = cP / totalMacroCal;
  const cRatio = cC / totalMacroCal;
  const fRatio = cF / totalMacroCal;

  // Determine active segments for gap calculation
  const activeCount = [cP, cC, cF].filter(v => v > 0).length;
  
  // Gap calculation (ensure enough space for rounded tips)
  // Round cap adds stroke/2 at each end, so we need gap > stroke to avoid overlap
  const minGap = stroke * 1.2; 
  const totalGapLen = activeCount > 1 ? (activeCount - 1) * minGap : 0;
  
  // Available length for segments
  const availableLen = Math.max(0, totalArcLen - totalGapLen);

  // Segment lengths
  const pLen = pRatio * availableLen;
  const cLen = cRatio * availableLen;
  const fLen = fRatio * availableLen;

  // Helper to convert length to degrees
  const toDeg = (len: number) => (len / circ) * 360;
  const gapDeg = toDeg(minGap);

  // Rotation accumulators
  let currentRot = -90; // Start at top

  // Protein props
  const pRot = currentRot;
  const pDeg = toDeg(pLen);
  if (pLen > 0) currentRot += pDeg + gapDeg;
  
  // Carbs props
  const cRot = currentRot;
  const cDeg = toDeg(cLen);
  if (cLen > 0) currentRot += cDeg + gapDeg;
  
  // Fats props
  const fRot = currentRot;

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        
        {/* Track Background */}
        <Circle
          cx={size/2} cy={size/2} r={r}
          stroke="#1A1A1A" strokeWidth={stroke}
          fill="transparent"
        />
        
        {/* Segments (Round Caps) */}
        
        {pLen > 1 && <Circle
          cx={size/2} cy={size/2} r={r}
          stroke={overrideColor || D.protein} strokeWidth={stroke} strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${pLen} ${circ}`} 
          rotation={pRot} origin={`${size/2}, ${size/2}`}
        />}

        {cLen > 1 && <Circle
          cx={size/2} cy={size/2} r={r}
          stroke={overrideColor || D.carbs} strokeWidth={stroke} strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${cLen} ${circ}`}
          rotation={cRot} origin={`${size/2}, ${size/2}`}
        />}
        
        {fLen > 1 && <Circle
          cx={size/2} cy={size/2} r={r}
          stroke={overrideColor || D.fats} strokeWidth={stroke} strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${fLen} ${circ}`}
          rotation={fRot} origin={`${size/2}, ${size/2}`}
        />}

      </Svg>
      {/* Center Content */}
      {children}
    </View>
  );
}

// --- Component ----------------------------------------------------------------
export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const [userData, setUserData] = useState<UserDTO | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekSuccessData, setWeekSuccessData] = useState<boolean[]>([]);
  const isSuccessfulDay = weekSuccessData[new Date().getDay()] ?? false;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          const userId = await getUserIdFromToken();
          const user = await GetUserDetails();
          
          if (isActive) setUserData(user);
          
          if (userId) {
              const meals = await Meal.getTodayMeals(database, userId);
              if (isActive) setTodayMeals(meals);
              
              // Week success
              // Align with getWeekDays logic (Monday start)
              const today = new Date();
              const currentDay = today.getDay(); // 0=Sun, 1=Mon
              // Monday of current week
              const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
              const monday = new Date(today);
              monday.setDate(diff);

              const data: boolean[] = [];
              for (let i = 0; i < 7; i++) {
                  const d = new Date(monday); // Create new date object based on Monday
                  d.setDate(monday.getDate() + i);
                  data.push(await Meal.DaySuccesfulCalorieIntake(database, userId, d));
              }
              if (isActive) setWeekSuccessData(data);
          }
        } catch (e) { console.error(e); } 
        finally { if (isActive) setLoading(false); }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const getWeekDays = () => {
    const today = new Date();
    // Start from Monday (or adapt to locale, but assuming Mon-Sun or Sun-Sat based on ref)
    // Reference shows "Mon 19, Tue 20..." so we should probably align with current day
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 1); // Monday start
    // If today is Sunday (0), this logic needs tweak, but sticking to simple for now:
    // Actually typically easiest to just show surrounding days or current week.
    // Let use standard "current week" starting Monday
    const currentDay = today.getDay(); // 0=Sun, 1=Mon
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === new Date().toDateString();
      return {
        dayName:   d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        isToday,
      };
    });
  };

  const getStreak = () => {
    const todayIdx = new Date().getDay();
    let streak = 0;
    for (let i = todayIdx; i >= 0; i--) {
      // Logic could be improved depending on how weekSuccessData is structured (Mon-Sun vs Sun-Sat)
      // For now simple checking
      if (weekSuccessData[i]) streak++;
      else if (i !== todayIdx) break; // Allow today to not be successful yet
    }
    return streak; // Simplified streak logic
  };

  const totals = todayMeals.reduce(
    (a, m) => ({ 
      calories: a.calories + m.calories, 
      protein: a.protein + m.protein, 
      carbs: a.carbs + m.carbohydrates, 
      fats: a.fats + (m.fats || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const targetCalories = userData?.caloricIntake || 2000;
  const isOver = totals.calories > targetCalories;
  const caloriesDisplay = isOver 
      ? Math.round(totals.calories - targetCalories) 
      : Math.round(targetCalories - totals.calories);
  
  const weekDays = getWeekDays();
  const streak = getStreak(); // Dummy streaks for now if logic is complex

  // Macros
  const proteinTarget = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.protein) / 4);
  const carbsTarget   = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.carbs) / 4);
  const fatsTarget    = Math.round((targetCalories * DEFAULT_MACRO_SPLIT.fats) / 9);

  if (loading) {
    return (
      <View style={[s.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: D.sub }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {isSuccessfulDay && <ConfettiCannon count={12} origin={{ x: -10, y: 0 }} />}
      <ScrollView style={s.scroll} contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 10 }]} showsVerticalScrollIndicator={false}>
        
        {/* Top Bar */}
        <FadeTranslate order={0}>
          <View style={s.topBar}>
             <Text style={s.screenTitle}>Nutrition</Text>
             {/* Coins Badge (Replaced Avatar) */}
             <View style={s.coinPill}>
                <FontAwesome5 name="coins" size={14} color="#FFD700" />
                <Text style={s.coinText}>20,710</Text>
            </View>
          </View>
        </FadeTranslate>

        {/* Hero Section: Minimal Vertical Stack (Only if calories logged) */}
        {totals.calories > 0 && (
          <FadeTranslate order={0.2}>
            <View style={s.heroContainer}>
                
                {/* Over Limit Warning Message (Top) */}
                {isOver && (
                    <View style={{ 
                        marginBottom: 16,
                        backgroundColor: "rgba(255, 69, 58, 0.15)", 
                        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
                        flexDirection: "row", alignItems: "center", gap: 8
                    }}>
                        <Ionicons name="warning" size={16} color="#FF453A" />
                        <Text style={{ color: "#FF453A", fontSize: 12, fontFamily: theme.bold }}>
                            Daily target exceeded
                        </Text>
                    </View>
                )}

                {/* 1. Top Indicator (Calories) */}
                <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="flame" size={18} color={isOver ? "#FF453A" : D.primary} />
                    <Text style={{ fontSize: 16, fontFamily: theme.bold, color: D.text }}>
                        {Math.round(totals.calories)} <Text style={{color: "#666"}}>/</Text> {targetCalories} Kcal
                    </Text>
                </View>

                {/* 2. Main Circle */}
                {/* Opacity only 0.8 if over, to keep it impactful but clearly error-state like */}
                <View style={[s.ringsContainer, isOver && { opacity: 0.9 }]}>
                    {/* Ring is always shown but can be styled differently if over */}
                     <SegmentedCircularProgress 
                        size={200} 
                        stroke={16} 
                        totals={totals}
                        targetCalories={targetCalories}
                        overrideColor={isOver ? "#FF453A" : undefined}
                    >
                        <View style={s.heroInner}>
                            <Text style={[s.heroBigVal, isOver && { color: "#FF453A" }]}>{caloriesDisplay}</Text>
                            <Text style={[s.heroLabel, isOver && { color: "#FF453A" }]}>{isOver ? "KCAL OVER" : "KCAL LEFT"}</Text>
                        </View>
                    </SegmentedCircularProgress>
                </View>

                {/* 3. Bottom Indicators (Macros with Icons) */}
                <View style={s.minimalLegendRow}>
                    {/* Protein - Meat/Muscle icon */}
                    <View style={s.miniLegendItem}>
                        <View style={[s.iconCircle, {backgroundColor: D.protein + "20"}]}>
                             <FontAwesome5 name="drumstick-bite" size={12} color={D.protein} />
                        </View>
                        <View>
                            <Text style={s.miniLegendLabel}>Protein</Text>
                            <Text style={s.miniLegendVal}>{Math.round(totals.protein)}g</Text>
                        </View>
                    </View>

                    {/* Carbs - Wheat/Bread icon */}
                    <View style={s.miniLegendItem}>
                         <View style={[s.iconCircle, {backgroundColor: D.carbs + "20"}]}>
                             <FontAwesome5 name="bread-slice" size={12} color={D.carbs} />
                        </View>
                        <View>
                            <Text style={s.miniLegendLabel}>Carbs</Text>
                            <Text style={s.miniLegendVal}>{Math.round(totals.carbs)}g</Text>
                        </View>
                    </View>

                    {/* Fats - Drop/Oil icon */}
                    <View style={s.miniLegendItem}>
                         <View style={[s.iconCircle, {backgroundColor: D.fats + "20"}]}>
                             <FontAwesome5 name="tint" size={12} color={D.fats} />
                        </View>
                        <View>
                            <Text style={s.miniLegendLabel}>Fats</Text>
                            <Text style={s.miniLegendVal}>{Math.round(totals.fats)}g</Text>
                        </View>
                    </View>
                </View>

            </View>
          </FadeTranslate>
        )}

        {/* Calendar Strip - No Border Lines */}
        <FadeTranslate order={0.4}>
          <View style={s.calendarRow}>
            {weekDays.map((day, i) => {
                const isSuccess = weekSuccessData[i] || false;
                const isPast = day.dayNumber < new Date().getDate(); // Simplified check (might fail month transitions but acceptable for now)
                
                return (
                    <View 
                        key={i} 
                        style={[
                            s.calDay, 
                            day.isToday && s.calDayActive,
                            ((!day.isToday && isSuccess) || (isPast && isSuccess)) && { 
                                backgroundColor: "rgba(170,251,5,0.15)", // Deep primary (dimmed)
                                borderColor: D.primary,
                                borderWidth: 0.5
                            }
                        ]}
                    >
                        <Text style={[
                            s.calName, 
                            day.isToday && { color: "#000" },
                            (!day.isToday && isSuccess) && { color: D.primary }
                        ]}>
                            {day.dayName}
                        </Text>
                        
                        <Text style={[
                            s.calNum, 
                            day.isToday && { color: "#000" },
                            (!day.isToday && isSuccess) && { color: D.primary }
                        ]}>
                            {day.dayNumber}
                        </Text>
                    </View>
                );
            })}
          </View>
        </FadeTranslate>

        {/* Actions Row (Scan / Search) */}
        <FadeTranslate order={1}>
            <View style={s.actionsRow}>
                <TouchableOpacity style={s.actionCard} onPress={() => router.push("../(screens)/ScanMeal")}>
                    <View style={[s.actionIconBox, { backgroundColor: D.primary }]}>
                        <Ionicons name="scan" size={24} color="#000" />
                    </View>
                    <View>
                        <Text style={s.actionTitle}>Scan Meal</Text>
                        <Text style={s.actionSub}>AI Camera</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={s.actionCard} onPress={() => { /* TODO: Search */ }}>
                    <View style={[s.actionIconBox, { backgroundColor: "#333" }]}>
                         <Ionicons name="search" size={24} color="#FFF" />
                    </View>
                    <View>
                        <Text style={s.actionTitle}>Search Food</Text>
                        <Text style={s.actionSub}>Database</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </FadeTranslate>

        {/* Meals List - No Borders */}
        {todayMeals.length > 0 ? (
          <FadeTranslate order={2}>
            {/* Header: Label + Meal Count */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionLabel}>History</Text>
              <View style={s.mealCountPill}>
                 <Text style={s.mealCountText}>{todayMeals.length} Entries</Text>
              </View>
            </View>

            <View style={s.mealsContainer}>
              {todayMeals.map((meal, i) => {
                const date = new Date(Number(meal.createdAt || Date.now()));
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                    <View key={meal.id} style={s.mealCard}>
                        {/* Left: Icon */}
                        <View style={s.mealIconBox}>
                            <Text style={s.mealEmoji}>{meal.oneEmoji ?? "🍽️"}</Text>
                        </View>
                        
                        {/* Middle: Info */}
                        <View style={s.mealInfo}>
                            <View style={s.mealTitleRow}>
                                <Text style={s.mealName} numberOfLines={1}>{meal.mealName}</Text>
                                <Text style={s.mealTime}>{timeStr}</Text>
                            </View>
                            
                            {/* Stats Row */}
                            <View style={s.mealStatsRow}>
                                <Text style={s.mealTotalCal}>{Math.round(meal.calories)} kcal</Text>
                                <View style={s.vertDiv} />
                                <Text style={s.mealMacroText}>P: {Math.round(meal.protein)}</Text>
                                <Text style={s.mealMacroText}>C: {Math.round(meal.carbohydrates)}</Text>
                                <Text style={s.mealMacroText}>F: {Math.round(meal.fats)}</Text>
                            </View>
                        </View>
                        
                        {/* Right: Chevron */}
                        <Ionicons name="chevron-forward" size={16} color="#444" style={{ marginLeft: 8 }} />
                    </View>
                );
              })}
            </View>
          </FadeTranslate>
        ) : (
          <FadeTranslate order={2}>
               {/* Empty State - Just text now since we have buttons above */}
               <View style={s.emptyState}>
                   <Ionicons name="nutrition-outline" size={48} color="#333" style={{marginBottom:12}} />
                   <Text style={{color: D.sub, textAlign: "center"}}>No meals logged today.</Text>
                   <Text style={{color: D.muted, textAlign: "center", fontSize: 12}}>Use the buttons above to add entries.</Text>
               </View>
          </FadeTranslate>
        )}

        <View style={s.bottomPad} />
      </ScrollView>

    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: D.bg },
  scroll:        { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 100,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 8 },
  screenTitle: { fontSize: 24, fontFamily: theme.black, color: D.text },
  
  coinPill: { 
    flexDirection: "row", alignItems: "center", gap: 6, 
    backgroundColor: D.card2, borderRadius: 20, 
    paddingHorizontal: 12, paddingVertical: 8, 
  },
  coinText: { fontSize: 13, fontFamily: theme.bold, color: D.text },
  
  // Hero
  heroContainer: { 
      alignItems: "center", 
      justifyContent: "center", 
      marginBottom: 30,
      marginTop: 20,
  },
  minimalLegendRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 20, // Increased gap for distinct icon sections
      marginTop: 20, // Moved to bottom
  },
  miniLegendItem: {
      flexDirection: "row", 
      alignItems: "center", 
      gap: 10,
      backgroundColor: "#161616", // Subtle pill for each macro
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12
  },
  iconCircle: {
      width: 28, height: 28, borderRadius: 14, 
      alignItems: "center", justifyContent: "center"
  },
  miniLegendLabel: {
      fontSize: 10, fontFamily: theme.medium, color: D.sub,
  },
  miniLegendVal: {
      fontSize: 12, fontFamily: theme.bold, color: D.text,
  },
  
  ringsContainer: {
      alignItems: "center",
      justifyContent: "center",
      // No margin right since stacked
  },
  heroInner: {  alignItems: "center", justifyContent: "center" },
  heroBigVal: { fontSize: 48, fontFamily: theme.black, color: D.text, lineHeight: 52, letterSpacing: -1 }, // Even bigger
  heroLabel: { fontSize: 11, fontFamily: theme.bold, color: D.primary, marginTop: 4, letterSpacing: 1 }, // Colored label

  // Deprecated Legend Styles
  legendContainer: { display: "none" },
  legendItem: { display: "none" },
  legendDot: { display: "none" },
  legendValRow: { display: "none" },
  legendLabel: { display: "none" },
  legendVal: { display: "none" },
  legendTarget: { display: "none" },
  miniDot: { display: "none" },
  
  // Deprecated/Unused
  heroLeft: { display: "none" },
  heroRight: { display: "none" },
  macroList: { display: "none" },
  macroRow: { 
    marginBottom: 12 
  },
  macroLabelRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4 
  },
  macroLabel: {
    fontSize: 12,
    fontFamily: theme.bold
  },
  macroVal: {
    fontSize: 12,
    color: D.sub,
    fontFamily: theme.medium
  },
  miniStatsRow: { display: "none" },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  miniStatText: { fontSize: 11, fontFamily: theme.medium, color: "#AAA" },
  
  // ... (rest of styles)
  
  heroMacroRow: { display: "none" }, // Deprecated
  extraStatsRow: { display: "none" }, // Deprecated

  heroTargetRow: { marginTop: 4, flexDirection: "row", alignItems: "baseline" },
  heroTargetText: { fontSize: 13, color: D.muted, fontFamily: theme.medium },

  // heroMacroItem etc can be removed or ignored
  heroMacroItem: { display: "none" },
  heroMacroVal: { display: "none" },
  heroMacroLabel: { display: "none" },
  macroBarBg: { width: "100%", height: 8, borderRadius: 4, backgroundColor: "#222", overflow:"hidden" },
  macroBarFill: { height: "100%", borderRadius: 4 },

  
  // Calendar - Ref style: Dark background for items, solid color for active
  calendarRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 30 },
  calDay: { 
    flex: 1, 
    backgroundColor: "#111", // Very dark mostly black
    borderRadius: 30, // Pill shape
    alignItems: "center", 
    justifyContent: "center",
    paddingVertical: 16, 
    minHeight: 80,
    // No borders as requested
  },
  calDayActive: { 
    backgroundColor: D.primary, // Fill with primary
  },
  calName: { fontSize: 11, fontFamily: theme.medium, color: "#666", marginBottom: 4 },
  calNum: { fontSize: 16, fontFamily: theme.bold, color: D.text },

  // Cards (No Borders)
  actionsRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 24 
  },
  actionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: D.card,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  actionIconBox: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  actionTitle: {
      fontSize: 14, fontFamily: theme.bold, color: D.text, marginBottom: 2,
  },
  actionSub: {
      fontSize: 11, fontFamily: theme.medium, color: D.sub,
  },

  // Meals Header
  sectionHeaderRow: { 
      flexDirection: "row", 
      justifyContent: "space-between", 
      alignItems: "center", 
      marginBottom: 16 
  },
  sectionLabel: { fontSize: 18, fontFamily: theme.bold, color: D.text },
  mealCountPill: { 
      backgroundColor: "#222", 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      borderRadius: 12 
  },
  mealCountText: { fontSize: 12, fontFamily: theme.bold, color: D.sub },

  mealsContainer: { gap: 12 },
  
  // New Meal Card Style
  mealCard: { 
      flexDirection: "row", 
      alignItems: "center", 
      backgroundColor: D.card, 
      borderRadius: 20, 
      padding: 16,
  },
  mealIconBox: { 
      width: 48, height: 48, 
      borderRadius: 16, 
      backgroundColor: "#1A1A1A", 
      alignItems: "center", 
      justifyContent: "center", 
      marginRight: 16 
  },
  mealEmoji: { fontSize: 24 },
  
  mealInfo: { flex: 1, gap: 4 },
  mealTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mealName: { fontSize: 15, fontFamily: theme.bold, color: D.text, flex: 1, marginRight: 8 },
  mealTime: { fontSize: 12, fontFamily: theme.medium, color: D.sub },
  
  mealStatsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  mealTotalCal: { fontSize: 13, fontFamily: theme.bold, color: D.primary },
  vertDiv: { width: 1, height: 12, backgroundColor: "#333" },
  mealMacroText: { fontSize: 11, fontFamily: theme.medium, color: "#888" },

  
  // Empty State
  emptyState: { alignItems: "center", paddingVertical: 40, opacity: 0.8 },

  fab: { 
      width: 60, height: 60, borderRadius: 30, 
      backgroundColor: D.primary, 
      alignItems: "center", justifyContent: "center",
      shadowColor: D.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: {width:0, height:4}
  },
  bottomPad: { height: 80 },
});

const MacroRow = ({label, val, target, color}:any) => (
    <View style={s.macroRow}>
        <View style={s.macroLabelRow}>
            <Text style={[s.macroLabel, {color: color, opacity: 0.9}]}>{label}</Text>
            <Text style={s.macroVal}>{val}g <Text style={{color:"#444"}}>/</Text> {target}g</Text>
        </View>
        {/* Track with #222 background to match circular progress track */}
        <View style={[s.macroBarBg, {backgroundColor: "#222"}]}>
             <View style={[s.macroBarFill, {backgroundColor: color, width: `${Math.min((val/target)*100, 100)}%`}]} />
        </View>
    </View>
);
