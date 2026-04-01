import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { MealDBApi, MealDBMeal } from "@/api/MealDBApi";
import FadeTranslate from "@/components/ui/FadeTranslate";

const { width: SCREEN_W } = Dimensions.get("window");


export const CATEGORIES = [
  "Beef", "Chicken", "Dessert", "Lamb", "Miscellaneous", "Pasta", 
  "Pork", "Seafood", "Side", "Starter", "Vegan", "Vegetarian", "Breakfast", "Goat"
] as const;

export const CATEGORY_EMOJI: Record<string, string> = {
  "Beef": "🥩", "Chicken": "🍗", "Dessert": "🍰", "Lamb": "🐑", 
  "Miscellaneous": "🍲", "Pasta": "🍝", "Pork": "🥓", "Seafood": "🦐", 
  "Side": "🍟", "Starter": "🥗", "Vegan": "🌱", "Vegetarian": "🥦", 
  "Breakfast": "🍳", "Goat": "🐐",
};


const D = {
  bg: "#000000",
  card: "#121212",
  card2: "#1C1C1E",
  primary: "#AAFB05",
  primaryDim: "rgba(170,251,5,0.15)",
  text: "#FFFFFF",
  sub: "#888888",
  muted: "#333333",
  border: "#2A2A2A",
};

export default function SearchFoodScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MealDBMeal[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (cuisine?: string | null) => {
    const trimmed = query.trim();
    const activeCategory = cuisine !== undefined ? cuisine : selectedCuisine;
    
    if (!trimmed && !activeCategory) return;
    
    setLoading(true);
    setSearched(true);
    try {
      if (trimmed) {
        const res = await MealDBApi.searchByName(trimmed);
        setResults(res);
      } else if (activeCategory) {
        const res = await MealDBApi.filterByCategory(activeCategory);
        setResults(res);
      }
    } catch (e) {
      console.error("Search failed", e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCuisinePress = (cuisine: string) => {
    const next = selectedCuisine === cuisine ? null : cuisine;
    setSelectedCuisine(next);
    if (next) {
      handleSearch(next);
    } else if (query.trim()) {
      handleSearch(null);
    } else {
      setResults([]);
      setSearched(false);
    }
  };

  const handleRecipePress = (recipe: MealDBMeal) => {
    router.push({
      pathname: "/(screens)/MealDetail",
      params: { mealId: String(recipe.idMeal) },
    });
  };

  const handleRandom = async () => {
    setLoading(true);
    setSearched(true);
    setQuery("");
    try {
      const recipe = await MealDBApi.random();
      if (recipe) {
        router.push({
          pathname: "/(screens)/MealDetail",
          params: { mealId: String(recipe.idMeal) },
        });
        setSearched(false);
      }
    } catch (e) {
      console.error("Random failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["rgba(170,251,5,0.08)", "transparent"]}
        style={s.bgGradient}
      />
      
      <View style={{ paddingTop: insets.top + 10, flex: 1 }}>
        {/* Top bar */}
        <View style={s.topBar}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={s.title}>Discover Recipes</Text>
          <TouchableOpacity style={s.randomBtn} onPress={handleRandom} activeOpacity={0.7}>
            <Ionicons name="shuffle" size={20} color={D.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <FadeTranslate order={0}>
            <Text style={s.heroTitle}>What are you craving?</Text>
            
            {/* Search Box */}
            <View style={s.searchRow}>
              <View style={s.searchBox}>
                <Ionicons name="search" size={20} color={D.sub} />
                <TextInput
                  style={s.searchInput}
                  placeholder="Search over 300k recipes..."
                  placeholderTextColor={D.sub}
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={() => handleSearch()}
                  returnKeyType="search"
                  autoCorrect={false}
                  selectionColor={D.primary}
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => { setQuery(""); setResults([]); setSearched(false); }} style={s.clearBtn}>
                    <Ionicons name="close-circle" size={18} color={D.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </FadeTranslate>

          <FadeTranslate order={0.1}>
            <View style={s.cuisineSectionHeader}>
              <Text style={s.sectionLabel}>Categories</Text>
              {selectedCuisine && (
                <TouchableOpacity onPress={() => handleCuisinePress(selectedCuisine)}>
                  <Text style={s.clearFilterText}>Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.cuisineRow}
            >
              {CATEGORIES.map((c) => {
                const active = selectedCuisine === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[s.cuisineChip, active && s.cuisineChipActive]}
                    onPress={() => handleCuisinePress(c)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.cuisineEmoji}>{CATEGORY_EMOJI[c] ?? "🍽️"}</Text>
                    <Text style={[s.cuisineText, active && s.cuisineTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </FadeTranslate>

          {/* Body Content */}
          <View style={s.resultsContainer}>
            {loading && (
              <View style={s.center}>
                <ActivityIndicator size="large" color={D.primary} />
                <Text style={s.loadingText}>Finding recipes...</Text>
              </View>
            )}

            {!loading && searched && results.length === 0 && (
              <FadeTranslate order={0.2}>
                <View style={s.center}>
                  <View style={s.emptyIconWrap}>
                    <Ionicons name="fast-food-outline" size={40} color={D.sub} />
                  </View>
                  <Text style={s.emptyTitle}>No Recipes Found</Text>
                  <Text style={s.emptyText}>Try searching for something else or explore a different cuisine.</Text>
                </View>
              </FadeTranslate>
            )}

            {!loading && results.length > 0 && (
              <FadeTranslate order={0.2}>
                <View style={s.resultsHeader}>
                  <Text style={s.sectionLabel}>
                    Top Results
                  </Text>
                  <Text style={s.resultsCount}>{results.length}</Text>
                </View>

                <View style={s.resultsGrid}>
                  {results.map((recipe, idx) => {
                    
                    return (
                      <FadeTranslate key={recipe.idMeal} order={0.3 + (idx * 0.05)}>
                        <TouchableOpacity
                          style={s.resultCard}
                          activeOpacity={0.9}
                          onPress={() => handleRecipePress(recipe)}
                        >
                          <Image
                            source={{ uri: recipe.strMealThumb }}
                            style={s.resultImage}
                            resizeMode="cover"
                          />
                          <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)"]}
                            style={s.resultGradient}
                          />
                          <View style={s.resultInfo}>
                            <Text style={s.resultName} numberOfLines={2}>
                              {recipe.strMeal}
                            </Text>
                            

                          </View>
                        </TouchableOpacity>
                      </FadeTranslate>
                    );
                  })}
                </View>
              </FadeTranslate>
            )}

            {!searched && results.length === 0 && (
              <FadeTranslate order={0.2}>
                <View style={s.emptyState}>
                   <Image 
                      source={require("@/assets/icons/onboarding/salad.png")} 
                      style={s.emptyImage}
                      resizeMode="contain"
                   />
                   <Text style={s.emptyTitle}>Find Your Next Meal</Text>
                   <Text style={s.emptyText}>Search by name or select a cuisine to discover delicious and healthy recipes.</Text>
                </View>
              </FadeTranslate>
            )}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: D.bg },
  bgGradient: {
    position: "absolute", top: 0, left: 0, right: 0, height: 350,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontSize: 16, fontFamily: theme.bold, color: D.text, letterSpacing: 0.5,
  },
  randomBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: D.primaryDim,
    alignItems: "center", justifyContent: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // Hero
  heroTitle: {
    fontSize: 28, fontFamily: theme.black, color: D.text,
    paddingHorizontal: 20, marginTop: 24, marginBottom: 16,
  },

  // Search
  searchRow: { paddingHorizontal: 20, marginBottom: 30 },
  searchBox: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#161616", borderRadius: 20,
    paddingHorizontal: 16, height: 56, gap: 12,
    borderWidth: 1, borderColor: D.border,
  },
  searchInput: {
    flex: 1, fontSize: 16, fontFamily: theme.medium, color: D.text,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },

  // Cuisine Section
  cuisineSectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 18, fontFamily: theme.bold, color: D.text,
  },
  clearFilterText: {
    fontSize: 14, fontFamily: theme.semibold, color: D.primary,
  },
  cuisineRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 10 },
  cuisineChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#1A1A1A", borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  cuisineChipActive: {
    backgroundColor: D.primaryDim,
    borderColor: D.primary,
  },
  cuisineEmoji: { fontSize: 16 },
  cuisineText: {
    fontSize: 14, fontFamily: theme.semibold, color: D.text,
  },
  cuisineTextActive: { color: D.primary },

  // Main list
  resultsContainer: {
    marginTop: 24, paddingHorizontal: 20,
  },
  resultsHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16,
  },
  resultsCount: {
    backgroundColor: "#222", color: D.text, fontSize: 12, fontFamily: theme.bold,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: "hidden"
  },
  resultsGrid: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",
    rowGap: 16,
  },
  resultCard: {
    width: (SCREEN_W - 56) / 2, // 20 padding both sides + 16 gap
    height: 220,
    borderRadius: 24, overflow: "hidden",
    backgroundColor: D.card,
    borderWidth: 1, borderColor: D.border,
  },
  resultImage: {
    width: "100%", height: "100%",
  },
  resultGradient: {
    position: "absolute", top: "20%", bottom: 0, left: 0, right: 0,
  },
  resultInfo: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 14, paddingTop: 30,
  },
  resultName: {
    fontSize: 14, fontFamily: theme.bold, color: D.text, marginBottom: 8,
    lineHeight: 18,
  },
  macrosRow: {
    flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap"
  },
  macroPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  macroText: {
    fontSize: 10, fontFamily: theme.bold, color: "#FFF",
  },
  proteinDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: "#4CAF50"
  },

  // Empty & loading
  center: {
    alignItems: "center", justifyContent: "center", paddingVertical: 50,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#1A1A1A",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyState: {
    alignItems: "center", justifyContent: "center", paddingTop: 20,
  },
  emptyImage: {
    width: 120, height: 120, opacity: 0.8, marginBottom: 16,
  },
  loadingText: {
    fontSize: 15, fontFamily: theme.medium, color: D.sub, marginTop: 16,
  },
  emptyTitle: {
    fontSize: 20, fontFamily: theme.bold, color: D.text, marginBottom: 8, textAlign: "center"
  },
  emptyText: {
    fontSize: 14, fontFamily: theme.medium, color: D.sub, textAlign: "center", paddingHorizontal: 20, lineHeight: 20,
  },
});
