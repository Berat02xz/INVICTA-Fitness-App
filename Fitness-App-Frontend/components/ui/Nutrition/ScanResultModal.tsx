import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView, Animated, Platform, Image, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/constants/theme";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import FadeTranslate from "@/components/ui/FadeTranslate";

const { width } = Dimensions.get("window");

type MealResult = {
  type: "Meal";
  ShortMealName: string;
};

type MenuResult = {
  type: "Menu";
  Meals: Array<{
    MenuName: string;
    Calories: number;
    Ingredients: string[];
  }>;
};

type FridgeResult = {
  type: "Fridge";
  Meals: Array<{
    Meal: string;
    Calories: number;
    Ingredients: string[];
    TimeToMake: string;
  }>;
};

type ScanResult = MealResult | MenuResult | FridgeResult;

interface ScanResultModalProps {
  visible: boolean;
  result: ScanResult | null;
  imageUri?: string;
  onClose: () => void;
  fadeAnim: Animated.Value;
}

const ScanResultModal: React.FC<ScanResultModalProps> = ({
  visible,
  result,
  imageUri,
  onClose,
  fadeAnim,
}) => {
  if (!result) return null;

  const renderMealResult = (meal: MealResult) => {
    const qualityTags = meal.MealQuality
      ? meal.MealQuality.split(/[^a-zA-Z0-9\s]+/).map(t => t.trim()).filter(Boolean)
      : [];

    // Calculate percentages for visual bars (assuming arbitrary daily goals for visualization: P:150, C:200, F:70)
    // In a real app, these should come from user goals.
    const pFill = Math.min((meal.Protein / 40) * 100, 100); 
    const cFill = Math.min((meal.Carbs / 50) * 100, 100);
    const fFill = Math.min((meal.Fat / 20) * 100, 100);

    return (
      <View style={{ width: "100%" }}>
        {/* Top Image Section */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.foodImage} />
          ) : (
            <View style={[styles.foodImage, { backgroundColor: "#333", alignItems: "center", justifyContent: "center" }]}>
                <Text style={{fontSize: 60}}>{meal.OneEmoji || "🍽️"}</Text>
            </View>
          )}
          <View style={styles.imageOverlay} />
          <LinearGradient 
              colors={['transparent', 'rgba(0,0,0,0.9)']}
              style={styles.titleOverlay}
          >
             <FadeTranslate order={0}>
                <Text style={styles.mealTitle} numberOfLines={2}>{meal.ShortMealName}</Text>
             </FadeTranslate>
          </LinearGradient>
        </View>

        <View style={styles.cardContent}>
           {/* Primary Stat: Calories */}
           <FadeTranslate order={1}>
                <View style={styles.mainStatRow}>
                    <View style={styles.calLimit}>
                        <Ionicons name="flame" size={24} color={theme.primary} />
                        <Text style={styles.calValue}>{meal.CaloriesAmount}</Text>
                        <Text style={styles.calLabel}>kcal</Text>
                    </View>
                    
                    {/* Health Score Pill */}
                    <View style={styles.healthScoreContainer}>
                        <View style={[styles.scoreBadge, { 
                            backgroundColor: meal.HealthScoreOutOf10 >= 7 ? theme.primary : 
                                            meal.HealthScoreOutOf10 >= 4 ? "#FFA500" : "#FF453A"
                        }]}>
                            <Text style={styles.scoreValue}>{meal.HealthScoreOutOf10}</Text>
                        </View>
                        <Text style={styles.scoreLabel}>Health Score</Text>
                    </View>
                </View>
           </FadeTranslate>

           {/* Macros Grid */}
           <FadeTranslate order={2} translateYFrom={20}>
               <View style={styles.macrosContainer}>
                   <MacroCard label="Protein" value={`${meal.Protein}g`} fill={pFill} color="#64D2FF" icon="fitness-outline" />
                   <MacroCard label="Carbs" value={`${meal.Carbs}g`} fill={cFill} color="#BF5AF2" icon="leaf-outline" />
                   <MacroCard label="Fat" value={`${meal.Fat}g`} fill={fFill} color="#FF9F0A" icon="water-outline" />
               </View>
           </FadeTranslate>

            {/* Tags / Quality */}
            <FadeTranslate order={3} translateYFrom={20}>
                <View style={styles.tagsContainer}>
                    {qualityTags.map((tag, i) => (
                        <View key={i} style={styles.tagPill}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </FadeTranslate>
            
            {/* Description / Analysis (Placeholder if needed, or omitted if not provided) */}
        </View>
      </View>
    );
  };

  const MacroCard = ({ label, value, fill, color, icon }: any) => (
      <View style={styles.macroCard}>
          <View style={styles.macroHeader}>
             <Ionicons name={icon} size={14} color={color} style={{opacity: 0.8}} />
             <Text style={[styles.macroLabel, {color}]}>{label}</Text>
          </View>
          <Text style={styles.macroValue}>{value}</Text>
          <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${fill}%`, backgroundColor: color }]} />
          </View>
      </View>
  );

  const renderMenuResult = (menu: MenuResult) => (
    <View style={styles.textResultContainer}>
      <View style={styles.headerSimple}>
        <Text style={styles.emojiSimple}>📋</Text>
        <Text style={styles.titleSimple}>Detected Menu</Text>
      </View>
      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {menu.Meals.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.rowBetween}>
                <Text style={styles.itemName}>{item.MenuName}</Text>
                <Text style={styles.itemCals}>{item.Calories} kcal</Text>
            </View>
            <Text style={styles.itemIngredients}>{item.Ingredients.join(" • ")}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderFridgeResult = (fridge: FridgeResult) => (
    <View style={styles.textResultContainer}>
      <View style={styles.headerSimple}>
        <Text style={styles.emojiSimple}>🧊</Text>
        <Text style={styles.titleSimple}>Fridge Ideas</Text>
      </View>
      <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
        {fridge.Meals.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.rowBetween}>
                <Text style={styles.itemName}>{item.Meal}</Text>
                <View style={styles.timeTag}>
                     <Ionicons name="time-outline" size={12} color="#AAA" />
                     <Text style={styles.timeText}>{item.TimeToMake}</Text>
                </View>
            </View>
            <Text style={styles.itemCals}>{item.Calories} kcal</Text>
            <Text style={styles.itemIngredients}>{item.Ingredients.join(", ")}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
         {/* Background Blur */}
         <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

         <Pressable style={styles.backdrop} onPress={onClose} />
         
         <Animated.View style={[
             styles.modalContainer, 
             { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }
         ]}>
            <View style={styles.innerContainer}>
                {result.type === "Meal" && renderMealResult(result)}
                {result.type === "Menu" && renderMenuResult(result)}
                {result.type === "Fridge" && renderFridgeResult(result)}
                
                {/* Action Buttons */}
                <View style={styles.actionRow}>
                   <Pressable style={styles.secondaryBtn} onPress={onClose}>
                       <Text style={styles.secondaryBtnText}>Retry</Text>
                   </Pressable>
                   <Pressable style={styles.primaryBtn} onPress={onClose}>
                       <Text style={styles.primaryBtnText}>Log Food</Text>
                       <Ionicons name="arrow-forward" size={18} color="black" />
                   </Pressable>
                </View>
            </View>
         </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0,0,0,0.5)", // handled by BlurView
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: "#1C1C1E",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  innerContainer: {
    // padding handled by children
  },
  
  // -- Meal Render Styles --
  imageContainer: {
    height: 200,
    width: "100%",
    backgroundColor: "#000",
    position: "relative",
  },
  foodImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    // gradient?
  },
  titleOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    // Gradient handled by LinearGradient component
  },
  mealTitle: {
    fontSize: 26,
    fontFamily: theme.bold,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardContent: {
      padding: 20,
  },
  
  // Stats
  mainStatRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      backgroundColor: "#2C2C2E",
      borderRadius: 16,
      padding: 16,
  },
  calLimit: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
  },
  calValue: {
      fontSize: 32,
      fontFamily: theme.bold,
      color: "#FFF",
      lineHeight: 36,
  },
  calLabel: {
      fontSize: 16,
      fontFamily: theme.medium,
      color: theme.primary,
      marginBottom: 6,
  },
  healthScoreContainer: {
      alignItems: "center",
  },
  scoreBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
  },
  scoreValue: {
      fontSize: 18,
      fontFamily: theme.bold,
      color: "#FFF",
  },
  scoreLabel: {
      fontSize: 10,
      color: "#888",
      fontFamily: theme.medium,
  },

  // Macros
  macrosContainer: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 24,
  },
  macroCard: {
      flex: 1,
      backgroundColor: "#2C2C2E",
      borderRadius: 12,
      padding: 12,
  },
  macroHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 8,
  },
  macroLabel: {
      fontSize: 12,
      fontFamily: theme.medium,
  },
  macroValue: {
      fontSize: 16,
      fontFamily: theme.bold,
      color: "#FFF",
      marginBottom: 8,
  },
  progressBarBg: {
      height: 4,
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 2,
      overflow: "hidden",
  },
  progressBarFill: {
      height: "100%",
      borderRadius: 2,
  },

  // Tags
  tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 10,
  },
  tagPill: {
      backgroundColor: "rgba(255,255,255,0.1)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.05)",
  },
  tagText: {
      fontSize: 12,
      color: "#DDD",
      fontFamily: theme.medium,
  },

  // Actions
  actionRow: {
      flexDirection: "row",
      padding: 20,
      paddingTop: 0,
      gap: 12,
  },
  secondaryBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#444",
      alignItems: "center",
      justifyContent: "center",
  },
  secondaryBtnText: {
      color: "#FFF",
      fontSize: 16,
      fontFamily: theme.bold,
  },
  primaryBtn: {
      flex: 2,
      backgroundColor: theme.primary,
      paddingVertical: 14,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
  },
  primaryBtnText: {
      color: "#000",
      fontSize: 16,
      fontFamily: theme.bold,
  },

  // -- Menu / Fridge Styles (Simple) --
  textResultContainer: {
      padding: 24,
      maxHeight: 500,
  },
  headerSimple: {
      alignItems: "center",
      marginBottom: 20,
  },
  emojiSimple: {
      fontSize: 48,
      marginBottom: 10,
  },
  titleSimple: {
      fontSize: 22,
      color: "#FFF",
      fontFamily: theme.bold,
  },
  scrollList: {
      maxHeight: 300,
  },
  listItem: {
      backgroundColor: "#2C2c2E",
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
  },
  rowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
  },
  itemName: {
      color: "#FFF",
      fontFamily: theme.bold,
      fontSize: 16,
      flex: 1,
  },
  itemCals: {
      color: theme.primary,
      fontFamily: theme.bold,
  },
  itemIngredients: {
      color: "#AAA",
      fontSize: 13,
      lineHeight: 18,
  },
  timeTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
  },
  timeText: {
      color: "#AAA",
      fontSize: 12,
  },
});

export default ScanResultModal;
