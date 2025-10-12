import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlassEffect from "@/components/ui/GlassEffect";
import { theme } from "@/constants/theme";

export interface CategoryItem {
  key: string;
  icon: string;
  label: string;
}

interface CategoriesPickerProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  style?: any;
}

export default function CategoriesPicker({
  categories,
  selectedCategory,
  onCategorySelect,
  style,
}: CategoriesPickerProps) {
  // Create animations for each category dynamically
  const categoryAnimations = useRef(
    categories.reduce((acc, cat) => {
      acc[cat.key] = new Animated.Value(cat.key === selectedCategory ? 1 : 0);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  // Handle category selection with animation
  const handleCategorySelection = (newCategory: string) => {
    if (newCategory === selectedCategory) return;
    
    // Animate out current category
    Animated.timing(categoryAnimations[selectedCategory], {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    // Update selected category
    onCategorySelect(newCategory);
    
    // Animate in new category
    Animated.timing(categoryAnimations[newCategory], {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <GlassEffect variant="pill" intensity={30} tint="dark" style={[styles.categoryPillContainer, style]}>
      {categories.map((cat) => (
        <Pressable
          key={cat.key}
          style={styles.categoryItem}
          onPress={() => handleCategorySelection(cat.key)}
        >
          <Animated.View style={[
            styles.categoryBackgroundCircle,
            selectedCategory === cat.key && {
              backgroundColor: "#fff",
              opacity: categoryAnimations[cat.key],
              transform: [{ 
                scale: categoryAnimations[cat.key] 
              }]
            }
          ]}>
            <MaterialCommunityIcons
              name={cat.icon as any}
              size={20}
              color={selectedCategory === cat.key ? "#000" : "#fff"}
            />
            {selectedCategory === cat.key && (
              <Animated.View style={{ 
                opacity: categoryAnimations[cat.key],
                transform: [{ 
                  scale: categoryAnimations[cat.key] 
                }]
              }}>
                <Text style={styles.categoryText}>{cat.label}</Text>
              </Animated.View>
            )}
          </Animated.View>
        </Pressable>
      ))}
    </GlassEffect>
  );
}

const styles = StyleSheet.create({
  categoryPillContainer: {
    marginBottom: 16,
  },
  categoryItem: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBackgroundCircle: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    marginLeft: 6,
    fontFamily: theme.bold,
    color: "#000",
    fontSize: 13,
  },
});