import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  Animated,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";
import { useIsFocused } from "@react-navigation/native";
import SolidBackground from "@/components/ui/SolidBackground";
import Constants from "expo-constants";
import HorizontalPicker from "@vseslav/react-native-horizontal-picker";
import { AIEndpoint } from "@/api/AIEndpoint";
import { get } from "axios";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import MealInfo from "@/components/ui/Nutrition/MealInfo";

// Meal response
export type MealInfoResponse = {
  isMeal: boolean;
  ShortMealName: string;
  CaloriesAmount: number;
  Protein: number;
  Carbs: number;
  Fat: number;
  Label: "HighFat" | "BalancedMeal" | "MacroRich" | "ConsiderLighterOption" | "DairyRich";
};

// Menu response
export type MenuInfoResponse = {
  Meals: {
    MenuName: string;
    Calories: number;
    Ingredients: string[];
  }[];
};

// Fridge response
export type FridgeInfoResponse = {
  Meals: {
    Meal: string;
    Calories: number;
    Ingredients: string[];
    TimeToMake: string;
  }[];
};

// Union type
export type AIResponse = MealInfoResponse | MenuInfoResponse | FridgeInfoResponse;

function isMealResponse(resp: AIResponse): resp is MealInfoResponse {
  return "isMeal" in resp;
}

function isMenuResponse(resp: AIResponse): resp is MenuInfoResponse {
  return "Meals" in resp && resp.Meals.length > 0 && "MenuName" in resp.Meals[0];
}

function isFridgeResponse(resp: AIResponse): resp is FridgeInfoResponse {
  return "Meals" in resp && resp.Meals.length > 0 && "Meal" in resp.Meals[0];
}

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused();
  const [capturedPhoto, setCapturedPhoto] =
    useState<CameraCapturedPicture | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [mode, setMode] = useState<"photo" | "search">("photo");
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const categories = ["Fridge", "Meal", "Menu"];
  const [selectedCategory, setSelectedCategory] = useState(1); // default: Meal

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.2,
        skipProcessing: false,
        base64: false,
      });
      setCapturedPhoto(photo);

      setLoadingInfo(true);
      setShowInfoCard(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      const mealImageFile = {
        uri: photo.uri,
        name: `photo_${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("Failed to get user ID");
        return;
      }
      const aiMealResponse = await AIEndpoint.uploadMeal(
        userId,
        mealImageFile,
        categories[selectedCategory]
      );
      console.warn("AI Meal Response:", aiMealResponse);

      setAiResponse(aiMealResponse as AIResponse);
      setLoadingInfo(false);
    } catch (e) {
      console.warn("CATCH: Failed to take photo", e);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <>
        <SolidBackground style={StyleSheet.absoluteFill} />
        <View style={styles.container}>
          <Text style={styles.permissionText}>
            We need your permission to use the camera
          </Text>
          <Pressable
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </>
    );
  }

  const renderCategoryItem = (item: string, index: number) => (
    <View style={[styles.categoryItem, { width: 120 }]}>
      <Text
        style={[
          styles.categoryText,
          index === selectedCategory ? styles.selectedText : null,
        ]}
      >
        {item}
      </Text>
    </View>
  );

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View
        style={[styles.container, { paddingTop: Constants.statusBarHeight }]}
      >
        <View style={styles.cameraContainer}>
          {/* Mode Switch */}
          <View style={styles.modeSwitch}>
            <Pressable
              style={[styles.modeButton, mode === "photo" && styles.activeMode]}
              onPress={() => setMode("photo")}
            >
              <Text
                style={[styles.modeText, mode === "photo" && styles.activeText]}
              >
                Photo
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeButton,
                mode === "search" && styles.activeMode,
              ]}
              onPress={() => setMode("search")}
            >
              <Text
                style={[
                  styles.modeText,
                  mode === "search" && styles.activeText,
                ]}
              >
                Search
              </Text>
            </Pressable>
          </View>

          {mode === "photo" && (
            <>
              {/* Camera Preview */}
              <View style={styles.cameraWrapper}>
                {isFocused && !capturedPhoto && (
                  <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing="back"
                    mute
                  />
                )}
                {capturedPhoto && (
                  <Image
                    source={{ uri: capturedPhoto.uri }}
                    style={styles.camera}
                  />
                )}

                {categories[selectedCategory] === "Meal" && aiResponse && isMealResponse(aiResponse) && (
  <MealInfo>
    <Text style={styles.infoText}>{aiResponse.ShortMealName}</Text>
    <Text style={styles.infoText}>Calories: {aiResponse.CaloriesAmount} kcal</Text>
    <Text style={styles.infoText}>Protein: {aiResponse.Protein} g</Text>
    <Text style={styles.infoText}>Carbs: {aiResponse.Carbs} g</Text>
    <Text style={styles.infoText}>Fat: {aiResponse.Fat} g</Text>
    <Text style={styles.infoText}>Label: {aiResponse.Label}</Text>
  </MealInfo>
)}

{categories[selectedCategory] === "Menu" && aiResponse && isMenuResponse(aiResponse) && (
  <MealInfo>
    <Text style={styles.infoText}>Menu:</Text>
    {aiResponse.Meals.map((meal, idx) => (
      <View key={idx} style={{ marginTop: 6 }}>
        <Text style={styles.infoText}>{meal.MenuName} — {meal.Calories} kcal</Text>
        <Text style={styles.infoText}>Ingredients: {meal.Ingredients.join(", ")}</Text>
      </View>
    ))}
  </MealInfo>
)}

{categories[selectedCategory] === "Fridge" && aiResponse && isFridgeResponse(aiResponse) && (
  <MealInfo>
    <Text style={styles.infoText}>Fridge Suggestions:</Text>
    {aiResponse.Meals.map((meal, idx) => (
      <View key={idx} style={{ marginTop: 6 }}>
        <Text style={styles.infoText}>{meal.Meal} — {meal.Calories} kcal</Text>
        <Text style={styles.infoText}>Ingredients: {meal.Ingredients.join(", ")}</Text>
        <Text style={styles.infoText}>Time to Make: {meal.TimeToMake}</Text>
      </View>
    ))}
  </MealInfo>
)}


              </View>

              {/* Bottom Footer */}
              {!capturedPhoto && (
                <View style={styles.footer}>
                  <View style={{ height: 40, justifyContent: "center" }}>
                    <HorizontalPicker
                      data={categories}
                      itemWidth={120}
                      defaultIndex={selectedCategory}
                      animatedScrollToDefaultIndex
                      snapTimeout={200}
                      onChange={(index) => setSelectedCategory(index)}
                      renderItem={(item, index) =>
                        renderCategoryItem(item, index)
                      }
                    />
                  </View>

                  <Pressable
                    onPress={takePhoto}
                    style={[
                      styles.shutterButton,
                      isCapturing && { opacity: 0.6 },
                    ]}
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.shutterInner} />
                    )}
                  </Pressable>
                </View>
              )}
            </>
          )}

          {mode === "search" && (
            <View style={styles.searchCard}>
              <Text style={styles.searchTitle}>Search for Meals</Text>
              <TextInput
                placeholder="Search..."
                placeholderTextColor="#888"
                style={styles.searchInput}
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center" },
  cameraContainer: { flex: 1, width: "100%", alignItems: "center" },
  cameraWrapper: {
    width: "95%",
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 15,
    justifyContent: "flex-end",
  },
  camera: { width: "100%", height: "100%" },
  modeSwitch: {
    position: "absolute",
    top: 30,
    flexDirection: "row",
    backgroundColor: "#222",
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 10,
  },
  modeButton: { paddingVertical: 8, paddingHorizontal: 20 },
  modeText: { color: "#aaa", fontSize: 16 },
  activeMode: { backgroundColor: "#D72207" },
  activeText: { color: "#fff", fontWeight: "bold" },
  footer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
    marginTop: 12,
    flexDirection: "column",
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#D72207",
  },
  searchCard: {
    marginTop: 50,
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 16,
    width: "90%",
  },
  searchTitle: { color: "#fff", fontSize: 18, marginBottom: 12 },
  searchInput: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    color: "#fff",
    fontSize: 16,
  },
  permissionText: {
    color: "white",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 16,
  },
  permissionButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1e90ff",
    borderRadius: 8,
  },
  permissionButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  infoCard: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 16,
  },
  skeleton: { height: 50, backgroundColor: "#333", borderRadius: 10 },
  infoText: { color: "#fff", fontSize: 16, marginBottom: 4 },
  categoryItem: { justifyContent: "center", alignItems: "center" },
  categoryText: { fontSize: 16, color: "#888" },
  selectedText: { color: "#fff", fontWeight: "bold" },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cardButton: {
    flex: 1,
    backgroundColor: "#D72207",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cardButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
