import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, ScrollView, Animated, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { theme } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FadeTranslate from "@/components/ui/FadeTranslate";

type MealResult = {
  type: "Meal";
  ShortMealName: string;
  CaloriesAmount: number;
  Protein: number;
  Carbs: number;
  Fat: number;
  HealthScoreOutOf10: number;
  MealQuality: string;
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
  onClose: () => void;
  fadeAnim: Animated.Value;
}

const ScanResultModal: React.FC<ScanResultModalProps> = ({
  visible,
  result,
  onClose,
  fadeAnim,
}) => {
  if (!result) return null;

  const renderMealResult = (meal: MealResult) => {
    // Parse quality string into pills - split on any non-alphanumeric character
    const qualityString = meal.MealQuality || '';
    // Split on any character that is not a letter, number, or space
    const allPills = qualityString
      .split(/[^a-zA-Z0-9\s]+/)
      .map(item => item.trim())
      .filter(Boolean);

    return (
      <View style={styles.content}>
        {/* Header */}
        <FadeTranslate order={0}>
          <View style={styles.header}>
            <Text style={styles.title}>{meal.ShortMealName}</Text>
          </View>
        </FadeTranslate>

        {/* Calories Badge */}
        <FadeTranslate order={1}>
          <View style={styles.caloriesBadge}>
            <Text style={styles.caloriesText}>{meal.CaloriesAmount} kcal</Text>
          </View>
        </FadeTranslate>

        {/* Macros and Health Score Row */}
        <FadeTranslate order={2}>
          <View style={styles.statsRow}>
            {/* Macros */}
            <View style={styles.macroItem}>
              <Text style={styles.macroEmoji}>💪</Text>
              <Text style={styles.macroValue}>{meal.Protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroEmoji}>🍞</Text>
              <Text style={styles.macroValue}>{meal.Carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroEmoji}>🧈</Text>
              <Text style={styles.macroValue}>{meal.Fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
            
            {/* Health Score */}
            <View style={styles.macroItem}>
              <Text style={styles.macroEmoji}>❤️</Text>
              <Text style={styles.macroValue}>{meal.HealthScoreOutOf10}/10</Text>
              <Text style={styles.macroLabel}>Health</Text>
            </View>
          </View>
        </FadeTranslate>

        {/* Quality Analysis Pills */}
        <View style={styles.qualitySection}>
          <View style={styles.pillsContainer}>
            {allPills.map((pill, idx) => (
              <FadeTranslate key={idx} order={3 + idx * 0.5}>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    {pill}
                  </Text>
                </View>
              </FadeTranslate>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderMenuResult = (menu: MenuResult) => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>📋</Text>
        <Text style={styles.title}>Menu Items</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {menu.Meals.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.listItemHeader}>
              <Text style={styles.listItemName}>{item.MenuName}</Text>
              <View style={styles.caloriesBadgeSmall}>
                <Text style={styles.caloriesTextSmall}>{item.Calories} kcal</Text>
              </View>
            </View>
            <Text style={styles.ingredientsText}>
              🥦 {item.Ingredients.slice(0, 3).join(" • ")}
              {item.Ingredients.length > 3 && "..."}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderFridgeResult = (fridge: FridgeResult) => (
    <View style={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🧊</Text>
        <Text style={styles.title}>Recipe Suggestions</Text>
      </View>

      {/* Recipe Items */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {fridge.Meals.map((item, idx) => (
          <View key={idx} style={styles.listItem}>
            <View style={styles.listItemHeader}>
              <Text style={styles.listItemName}>{item.Meal}</Text>
              <View style={styles.caloriesBadgeSmall}>
                <Text style={styles.caloriesTextSmall}>{item.Calories} kcal</Text>
              </View>
            </View>
            <Text style={styles.ingredientsText}>
              🥦 {item.Ingredients.slice(0, 3).join(" • ")}
              {item.Ingredients.length > 3 && "..."}
            </Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeIcon}>⏱️</Text>
              <Text style={styles.timeText}>{item.TimeToMake}</Text>
            </View>
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
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          {Platform.OS === "android" ? (
            <View style={[styles.blurContainer, styles.solidBackground]}>
              {result.type === "Meal" && renderMealResult(result)}
              {result.type === "Menu" && renderMenuResult(result)}
              {result.type === "Fridge" && renderFridgeResult(result)}

              {/* Close Button */}
              <FadeTranslate order={8} translateYFrom={30}>
                <Pressable style={styles.closeButton} onPress={onClose}>
                  <View style={styles.buttonContent}>
                    <MaterialCommunityIcons name="cloud-upload" size={20} color="#fff" />
                    <Text style={styles.closeButtonText}>Save & Close</Text>
                  </View>
                </Pressable>
              </FadeTranslate>
            </View>
          ) : (
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
              {result.type === "Meal" && renderMealResult(result)}
              {result.type === "Menu" && renderMenuResult(result)}
              {result.type === "Fridge" && renderFridgeResult(result)}

              {/* Close Button */}
              <FadeTranslate order={8} translateYFrom={30}>
                <Pressable style={styles.closeButton} onPress={onClose}>
                  <View style={styles.buttonContent}>
                    <MaterialCommunityIcons name="cloud-upload" size={20} color="#fff" />
                    <Text style={styles.closeButtonText}>Save & Close</Text>
                  </View>
                </Pressable>
              </FadeTranslate>
            </BlurView>
          )}
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    borderRadius: 24,
    overflow: "hidden",
  },
  blurContainer: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  solidBackground: {
    backgroundColor: "#000",
  },
  content: {
    alignItems: "center",
  },
  scrollContent: {
    width: "100%",
    maxHeight: 400,
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  caloriesBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  caloriesText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
    gap: 8,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 24,
    gap: 12,
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  macroEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 10,
    color: "#aaa",
  },
  healthSection: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  healthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  healthLabel: {
    fontSize: 14,
    color: "#bbb",
    fontWeight: "500",
  },
  healthScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  progressBar: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.primary,
    borderRadius: 6,
  },
  qualitySection: {
    width: "100%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  qualityAnalysis: {
    marginTop: 12,
  },
  qualityLabel: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pill: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  primaryPill: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: {
    fontSize: 11,
    color: "#ddd",
    fontWeight: "500",
  },
  primaryPillText: {
    color: "#fff",
    fontWeight: "700",
  },
  qualityText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  listItem: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginRight: 8,
  },
  caloriesBadgeSmall: {
    backgroundColor: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  caloriesTextSmall: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  ingredientsText: {
    fontSize: 14,
    color: "#ccc",
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: 8,
    alignSelf: "flex-start",
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  timeText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
  closeButton: {
    backgroundColor: theme.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ScanResultModal;
