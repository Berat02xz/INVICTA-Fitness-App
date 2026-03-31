import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { MealDBApi, MealDBMeal, estimateNutrition, getIngredients } from "@/api/MealDBApi";
import { CATEGORY_EMOJI } from "./SearchFood";
import { Meal } from "@/models/Meals";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import database from "@/database/database";

const { width: SCREEN_W } = Dimensions.get("window");

const D = {
  bg: "#000000",
  card: "#121212",
  cardAlt: "#1C1C1E",
  primary: "#AAFB05",
  primaryDim: "rgba(170,251,5,0.12)",
  text: "#FFFFFF",
  sub: "#888888",
  muted: "#333333",
};

export default function MealDetail() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mealId: string }>();

  const [recipe, setRecipe] = useState<MealDBMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!params.mealId) return;
    (async () => {
      try {
        const full = await MealDBApi.lookupById(params.mealId);
        setRecipe(full);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [params.mealId]);

  const handleLogMeal = async () => {
    if (!recipe || saving) return;
    setSaving(true);
    try {
      const userId = await getUserIdFromToken();
      if (!userId) return;
      
      const nutrition = estimateNutrition(recipe);
      const label = recipe.strCategory || "Meal";
      
      await Meal.createMeal(database, {
        userId,
        mealName: recipe.strMeal,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbohydrates: nutrition.carbs,
        fats: nutrition.fat,
        label,
        createdAt: Date.now(),
        healthScore: 5,
        oneEmoji: CATEGORY_EMOJI[recipe.strCategory] || "🍽️",
      });
      setSaved(true);
    } catch (e) {
      console.error("Failed to log meal", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.container, { paddingTop: insets.top }, s.center]}>
        <ActivityIndicator size="large" color={D.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[s.container, { paddingTop: insets.top }, s.center]}>
        <Ionicons name="alert-circle-outline" size={48} color={D.muted} />
        <Text style={s.emptyText}>Recipe not found</Text>
        <TouchableOpacity style={s.goBackBtn} onPress={() => router.back()}>
          <Text style={s.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ingredients = getIngredients(recipe);
  const nutrition = estimateNutrition(recipe);

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={[s.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color="#FFF" />
      </TouchableOpacity>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.heroWrap}>
          <Image
            source={{ uri: recipe.strMealThumb }}
            style={s.heroImg}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={s.heroGradient}
          />
          <View style={s.heroInfo}>
            <Text style={s.heroEmoji}>{CATEGORY_EMOJI[recipe.strCategory] || "🍽️"}</Text>
            <Text style={s.heroTitle}>{recipe.strMeal}</Text>
            <View style={s.heroMetaRow}>
              {recipe.strArea && (
                <View style={s.heroPill}>
                  <FontAwesome5 name="globe" size={10} color={D.primary} />
                  <Text style={s.heroPillText}>{recipe.strArea}</Text>
                </View>
              )}
              {recipe.strCategory && (
                <View style={s.heroPill}>
                  <Ionicons name="restaurant-outline" size={10} color={D.primary} />
                  <Text style={s.heroPillText}>{recipe.strCategory}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={s.nutritionCard}>
          <View style={s.nutritionHeader}>
            <Ionicons name="nutrition" size={16} color={D.primary} />
            <Text style={s.nutritionTitle}>Nutrition</Text>
          </View>
          <View style={s.nutrientRow}>
            <NutrientBox label="Calories" value={nutrition.calories} unit="kcal" color={D.primary} />
            <NutrientBox label="Protein" value={nutrition.protein} unit="g" color="#4FC3F7" />
            <NutrientBox label="Carbs" value={nutrition.carbs} unit="g" color="#FFB74D" />
            <NutrientBox label="Fat" value={nutrition.fat} unit="g" color="#E57373" />
          </View>
        </View>

        {(recipe.strTags) && (
          <View style={s.tagsRow}>
            {recipe.strTags.split(",").map((tag, i) => (
              <View key={`dt-${i}`} style={s.tagPill}>
                <Text style={s.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>
            Ingredients ({ingredients.length})
          </Text>
          <View style={s.ingredientGrid}>
            {ingredients.map((ing, idx) => {
              const imgUrl = `https://www.themealdb.com/images/ingredients/${ing.ingredient}-Small.png`;
              return (
                <View key={idx} style={s.ingredientRow}>
                  <View style={s.ingredientThumbWrap}>
                    <Image source={{ uri: imgUrl }} style={s.ingredientThumb} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.ingredientName}>{ing.ingredient}</Text>
                    <Text style={s.ingredientMeasure}>{ing.measure}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {recipe.strInstructions && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Instructions</Text>
            <Text style={s.instructionsText}>
              {recipe.strInstructions.replace(/<[^>]*>/g, "")}
            </Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[s.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[s.logBtn, saved && { backgroundColor: "#4CAF50" }]}
          onPress={handleLogMeal}
          disabled={saving || saved}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size={18} color="#000" />
          ) : (
            <>
              <Ionicons
                name={saved ? "checkmark-circle" : "add-circle"}
                size={20}
                color="#000"
              />
              <Text style={s.logBtnText}>
                {saved ? "Logged!" : "Log Meal"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NutrientBox({
  label, value, unit, color,
}: {
  label: string; value: number; unit: string; color: string;
}) {
  return (
    <View style={s.nutrientBox}>
      <Text style={[s.nutrientValue, { color }]}>{value}</Text>
      <Text style={s.nutrientUnit}>{unit}</Text>
      <Text style={s.nutrientLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  center: { alignItems: "center", justifyContent: "center" },
  emptyText: {
    fontSize: 14, fontFamily: theme.medium, color: D.sub, marginTop: 12,
  },
  goBackBtn: {
    marginTop: 20, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 14, backgroundColor: D.cardAlt,
  },
  goBackText: { fontSize: 14, fontFamily: theme.bold, color: D.text },

  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(30,30,30,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  heroWrap: {
    width: SCREEN_W,
    height: SCREEN_W * 0.75,
    overflow: "hidden",
  },
  heroImg: { width: "100%", height: "100%" },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  heroInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroEmoji: { fontSize: 28, marginBottom: 6 },
  heroTitle: {
    fontSize: 24,
    fontFamily: theme.black,
    color: D.text,
    marginBottom: 10,
  },
  heroMetaRow: { flexDirection: "row", gap: 8 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  heroPillText: {
    fontSize: 12, fontFamily: theme.semibold, color: D.text,
  },

  nutritionCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: D.cardAlt,
    borderRadius: 20,
    padding: 16,
  },
  nutritionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  nutritionTitle: {
    fontSize: 15, fontFamily: theme.bold, color: D.text, flex: 1,
  },
  nutrientRow: { flexDirection: "row", justifyContent: "space-between" },
  nutrientBox: { alignItems: "center", flex: 1 },
  nutrientValue: { fontSize: 22, fontFamily: theme.black },
  nutrientUnit: {
    fontSize: 10, fontFamily: theme.medium, color: D.sub, marginTop: -2,
  },
  nutrientLabel: {
    fontSize: 10, fontFamily: theme.medium, color: D.sub, marginTop: 2,
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tagPill: {
    backgroundColor: D.primaryDim,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: { fontSize: 11, fontFamily: theme.medium, color: D.primary },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    fontSize: 16, fontFamily: theme.bold, color: D.text, marginBottom: 12,
  },

  ingredientGrid: { gap: 8 },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: D.cardAlt,
    padding: 12,
    borderRadius: 14,
  },
  ingredientThumbWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E8E0D0",
    overflow: "hidden",
  },
  ingredientThumb: { width: 40, height: 40, borderRadius: 12 },
  ingredientName: {
    fontSize: 13, fontFamily: theme.semibold, color: D.text,
  },
  ingredientMeasure: {
    fontSize: 11, fontFamily: theme.medium, color: D.sub, marginTop: 1,
  },

  instructionsText: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: D.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  logBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: D.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logBtnText: {
    fontSize: 16, fontFamily: theme.bold, color: "#000",
  },
});
