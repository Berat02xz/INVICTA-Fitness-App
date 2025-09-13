import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';

interface MealCardProps {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  imageUrl?: string;
}

const MealCard: React.FC<MealCardProps> = ({
  name,
  time,
  calories,
  protein,
  carbs,
  fat,
  healthScore,
  imageUrl,
}) => {
  // Random food emojis for fallback
  const foodEmojis = ['🌮', '🥗', '🥙', '🍜', '🍖', '🥩', '🥓'];
  const randomEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealContent}>
        <View style={styles.mealImage}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }}
              style={styles.mealImagePhoto}
            />
          ) : (
            <Text style={styles.mealEmoji}>{randomEmoji}</Text>
          )}
        </View>
        <View style={styles.mealInfo}>
          <View style={styles.mealHeaderRow}>
            <Text style={styles.mealName}>{name}</Text>
            <Text style={styles.mealTime}>{time}</Text>
          </View>
          
          <View style={styles.mealDetailsContainer}>
            {/* Calories */}
            <View style={styles.caloriesDisplay}>
              <Ionicons name="flame" size={14} color="#fff" style={styles.caloriesIcon} />
              <Text style={styles.caloriesText}>{calories} Kcal</Text>
            </View>

            {/* Macros */}
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Ionicons name="flash" size={12} color="#fd0e07" style={styles.nutritionIcon} />
                <Text style={styles.nutritionValue}>{protein}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <MaterialCommunityIcons name="leaf" size={12} color="#ff8c00" style={styles.nutritionIcon} />
                <Text style={styles.nutritionValue}>{carbs}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Ionicons name="water" size={12} color="#1e90ff" style={styles.nutritionIcon} />
                <Text style={styles.nutritionValue}>{fat}g</Text>
              </View>
            </View>

            {/* Health Score */}
            <View style={styles.healthScore}>
              <Ionicons name="heart" size={14} color="#ff4757" style={styles.healthIcon} />
              <Text style={styles.healthText}>Score: </Text>
              <View style={styles.healthProgressContainer}>
                <View style={styles.healthProgressBackground}>
                  <View style={[styles.healthProgressFill, { width: `${healthScore * 10}%` }]} />
                </View>
              </View>
              <Text style={styles.healthNumber}>{healthScore}</Text>
              <Text style={styles.healthTotal}>/10</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: "rgba(30,30,30,0.95)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mealContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  mealImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: "rgba(205, 44, 44, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  mealImagePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover' as const,
  },
  mealEmoji: {
    fontSize: 50,
  },
  mealInfo: {
    flex: 1,
  },
  mealHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealName: {
    color: "#fff",
    fontFamily: theme.semibold,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  mealTime: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: theme.regular,
  },
  mealDetailsContainer: {
    justifyContent: "space-between",
    gap: 10,
  },
  caloriesDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  caloriesIcon: {
    marginRight: 4,
  },
  caloriesText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: theme.regular, // Changed from semibold to regular
  },
  nutritionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  nutritionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  nutritionIcon: {
    marginRight: 4,
  },
  nutritionValue: {
    color: "#fff",
    fontSize: 12,
    fontFamily: theme.medium,
  },
  healthScore: {
    flexDirection: "row",
    alignItems: "center",
  },
  healthIcon: {
    marginRight: 4,
  },
  healthText: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: theme.regular,
  },
  healthProgressContainer: {
    flex: 1,
    marginHorizontal: 8,
    justifyContent: "center",
  },
  healthProgressBackground: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  healthProgressFill: {
    height: "100%",
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  healthNumber: {
    color: "#fff",
    fontSize: 12,
    fontFamily: theme.regular,
  },
  healthTotal: {
    color: "#777",
    fontSize: 12,
    fontFamily: theme.light,
    opacity: 0.9,
  },
});

export default MealCard;