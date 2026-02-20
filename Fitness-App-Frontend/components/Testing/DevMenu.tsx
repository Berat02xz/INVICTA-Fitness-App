import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import database from "@/database/database";
import { Meal } from "@/models/Meals";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import { theme } from "@/constants/theme";

const MOCK_FOODS = [
  {
    name: "Chicken Breast & Rice",
    calories: 550,
    protein: 45,
    carbs: 60,
    fat: 10,
    emoji: "🍗",
    healthScore: 9,
    label: "High Protein",
  },
  {
    name: "Salmon Salad",
    calories: 420,
    protein: 35,
    carbs: 15,
    fat: 22,
    emoji: "🥗",
    healthScore: 10,
    label: "Healthy Fat",
  },
  {
    name: "Oatmeal with Berries",
    calories: 300,
    protein: 10,
    carbs: 50,
    fat: 6,
    emoji: "🥣",
    healthScore: 9,
    label: "Balanced Breakfast",
  },
  {
    name: "Cheeseburger",
    calories: 800,
    protein: 40,
    carbs: 50,
    fat: 45,
    emoji: "🍔",
    healthScore: 4,
    label: "Unhealthy",
  },
];

export default function DevMenu() {
  const [modalVisible, setModalVisible] = useState(false);

  const addMeal = async (food: typeof MOCK_FOODS[0], isYesterday: boolean) => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      const timestamp = new Date();
      if (isYesterday) {
        timestamp.setDate(timestamp.getDate() - 1);
      }

      await database.write(async () => {
        await database.get<Meal>("meals").create((meal) => {
          meal.userId = userId;
          meal.mealName = food.name;
          meal.calories = food.calories;
          meal.protein = food.protein;
          meal.carbohydrates = food.carbs;
          meal.fats = food.fat;
          meal.label = food.label;
          meal.createdAt = timestamp.getTime();
          meal.healthScore = food.healthScore;
          meal.oneEmoji = food.emoji;
        });
      });

      Alert.alert("Success", `Added ${food.name} for ${isYesterday ? "Yesterday" : "Today"}`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add meal");
    }
  };

  const deleteMeals = async (isYesterday: boolean) => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      const today = new Date();
      const targetDate = new Date(today);
      if (isYesterday) {
        targetDate.setDate(today.getDate() - 1);
      }
      
      // Construct start and end of the target day
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1).getTime();

      await database.write(async () => {
        // We can't use simple queries inside write easily if we want to delete, 
        // usually we query then delete in a batch or loop.
        // Let's fetch first.
        const mealsCollection = database.get<Meal>("meals");
        // We need to use low-level filtering if Q isn't imported or use raw query.
        // Assuming we can iterate. 
        // Better:
        const mealsToDelete = await mealsCollection.query(
            // We need Q here. Let's assume we can fetch all and filter in JS if complex, 
            // but effectively we want to delete by date range.
            // Since I don't have Q imported here easily without importing from watermelondb
        ).fetch();
        
        // Filter manually for safety if Q is tricky to mix
        const targetMeals = mealsToDelete.filter(m => 
             m.userId === userId && 
             m.createdAt >= startOfDay && 
             m.createdAt < endOfDay
        );

        if (targetMeals.length === 0) {
            Alert.alert("Info", "No meals found to delete.");
            return;
        }

        // Batch delete
        await database.batch(
            targetMeals.map(meal => meal.prepareDestroyPermanently())
        );
      });

      Alert.alert("Success", `Deleted ${isYesterday ? "Yesterday's" : "Today's"} meals`);

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to delete meals");
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconButton}>
         <Ionicons name="settings-outline" size={24} color="#FFF" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.modalText}>Dev Menu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Add Food (Today)</Text>
              {MOCK_FOODS.map((food, index) => (
                <TouchableOpacity 
                    key={`today-${index}`} 
                    style={styles.foodItem}
                    onPress={() => addMeal(food, false)}
                >
                    <Text style={styles.foodEmoji}>{food.emoji}</Text>
                    <View style={{flex: 1}}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodDetails}>{food.calories}kcal • {food.protein}p • {food.carbs}c • {food.fat}f</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={theme.primary} />
                </TouchableOpacity>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Add Food (Yesterday)</Text>
              {MOCK_FOODS.map((food, index) => (
                <TouchableOpacity 
                    key={`yesterday-${index}`} 
                    style={styles.foodItem}
                    onPress={() => addMeal(food, true)}
                >
                    <Text style={styles.foodEmoji}>{food.emoji}</Text>
                    <View style={{flex: 1}}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodDetails}>{food.calories}kcal • {food.protein}p • {food.carbs}c • {food.fat}f</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={theme.warning} />
                </TouchableOpacity>
              ))}

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Danger Zone</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMeals(false)}>
                <Ionicons name="trash-outline" size={20} color="#FFF" />
                <Text style={styles.deleteButtonText}>Delete Today's Meals</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.deleteButton, { marginTop: 10 }]} onPress={() => deleteMeals(true)}>
                <Ionicons name="trash-outline" size={20} color="#FFF" />
                <Text style={styles.deleteButtonText}>Delete Yesterday's Meals</Text>
              </TouchableOpacity>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    // padding: 8, // Removed padding to align with other icons
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 10,
    fontWeight: "600",
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  foodEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  foodName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  foodDetails: {
    color: "#888",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 20,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.error,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
