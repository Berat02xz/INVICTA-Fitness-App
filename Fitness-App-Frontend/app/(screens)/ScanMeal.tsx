import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
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
import { AIEndpoint } from "@/api/AIEndpoint";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import MealInfo from "@/components/ui/Nutrition/MealInfo";
import * as ImageManipulator from "expo-image-manipulator";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Meal/AI types
export type MealInfoResponse = { isMeal: boolean; ShortMealName: string; CaloriesAmount: number; Protein: number; Carbs: number; Fat: number; MealQuality: string; };
export type MenuInfoResponse = { Meals: { MenuName: string; Calories: number; Ingredients: string[]; }[]; };
export type FridgeInfoResponse = { Meals: { Meal: string; Calories: number; Ingredients: string[]; TimeToMake: string; }[]; };
export type AIResponse = MealInfoResponse | MenuInfoResponse | FridgeInfoResponse;

function isMealResponse(resp: AIResponse): resp is MealInfoResponse { return "isMeal" in resp; }
function isMenuResponse(resp: AIResponse): resp is MenuInfoResponse { return "Meals" in resp && resp.Meals.length > 0 && "MenuName" in resp.Meals[0]; }
function isFridgeResponse(resp: AIResponse): resp is FridgeInfoResponse { return "Meals" in resp && resp.Meals.length > 0 && "Meal" in resp.Meals[0]; }

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused();
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [resizedPhoto, setResizedPhoto] = useState<ImageManipulator.ImageResult | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const corners = ["topLeft", "topRight", "bottomLeft", "bottomRight"] as const;

  const categories = [
    { key: "Scan Fridge", icon: "fridge-outline" },
    { key: "Scan Meal", icon: "food" },
    { key: "Scan Menu", icon: "clipboard-text-outline" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("Scan Meal"); //default key
  const [flash, setFlash] = useState(false);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.8, 
        skipProcessing: false, 
        base64: false,
        shutterSound: false
      });
      setCapturedPhoto(photo);
      const smallPhoto = await ImageManipulator.manipulateAsync(photo.uri, [{ resize: { width: 256 } }], { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG });
      setResizedPhoto(smallPhoto);

      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

      const mealImageFile = { uri: smallPhoto.uri, name: `photo_${Date.now()}.jpg`, type: "image/jpeg" };
      const userId = await getUserIdFromToken();
      if (!userId) return;
      const aiMealResponse = await AIEndpoint.uploadMeal(userId, mealImageFile, selectedCategory);
      setAiResponse(aiMealResponse as AIResponse);
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
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to use the camera</Text>
          <Pressable onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        <View style={styles.cameraWrapper}>
          {isFocused && !capturedPhoto && (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              mute
              flash={flash ? "on" : "off"}
            />
          )}
          {capturedPhoto && <Image source={{ uri: capturedPhoto.uri }} style={StyleSheet.absoluteFill} />}

          {/* Top Title */}
          <View style={styles.topBar}>
            <Text style={styles.title}>Food Scanner</Text>
          </View>

          {/* Focus Guidelines */}
          <View style={styles.focusGuideline}>
            {["topLeft","topRight","bottomLeft","bottomRight"].map((corner) => (
              <View key={corner} style={[styles.corner, styles[corner]]}/>
            ))}
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Flash */}
            <Pressable style={styles.flashButton} onPress={() => setFlash(!flash)}>
              <MaterialCommunityIcons name={flash ? "flash" : "flash-off"} size={28} color="#fff" />
            </Pressable>

            {/* Vertical stack for category + snap */}
            <View style={styles.snapCategoryWrapper}>
              {/* Category Picker */}
              <View style={styles.categoryPill}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.key}
                    style={[styles.categoryItem, selectedCategory === cat.key && styles.selectedCategory]}
                    onPress={() => setSelectedCategory(cat.key)}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon as any}
                      size={24}
                      color={selectedCategory === cat.key ? "#000" : "#fff"}
                    />
                    {selectedCategory === cat.key && <Text style={styles.categoryText}>{cat.key}</Text>}
                  </Pressable>
                ))}
              </View>

              {/* Snap Button */}
              <Pressable
                onPress={takePhoto}
                style={[styles.snapButton, isCapturing && { opacity: 0.6 }]}
                disabled={isCapturing}
              >
                {isCapturing ? <ActivityIndicator color="#fff" /> : <View style={styles.snapInner} />}
              </Pressable>
            </View>
          </View>

          {/* AI Card */}
          {aiResponse && (
            <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
              {selectedCategory === "Meal" && isMealResponse(aiResponse) && (
                <MealInfo>
                  <Text style={styles.infoText}>{aiResponse.ShortMealName}</Text>
                  <Text style={styles.infoText}>Calories: {aiResponse.CaloriesAmount} kcal</Text>
                  <Text style={styles.infoText}>Protein: {aiResponse.Protein} g</Text>
                  <Text style={styles.infoText}>Carbs: {aiResponse.Carbs} g</Text>
                  <Text style={styles.infoText}>Fat: {aiResponse.Fat} g</Text>
                  <Text style={styles.infoText}>Label: {aiResponse.MealQuality}</Text>
                </MealInfo>
              )}
              {selectedCategory === "Menu" && isMenuResponse(aiResponse) && (
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
              {selectedCategory === "Fridge" && isFridgeResponse(aiResponse) && (
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
            </Animated.View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cameraWrapper: { flex: 1 },
  topBar: { position: "absolute", top: Constants.statusBarHeight + 10, width: "100%", alignItems: "center", zIndex: 10 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },

  // focus corners
  focusGuideline: { position: "absolute", top: "35%", left: "15%", width: "70%", height: "30%" },
  corner: { width: 30, height: 50, borderColor: "#fff", borderWidth: 3, borderRadius:3 , position: "absolute" },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  bottomControls: { position: "absolute", bottom: 30, width: "100%", flexDirection: "row", justifyContent: "center", alignItems: "flex-end" },
  snapCategoryWrapper: { flexDirection: "column", alignItems: "center" },
  snapButton: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: "#fff", justifyContent: "center", alignItems: "center", marginTop: 10 },
  snapInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff" },
  flashButton: { position: "absolute", left: 40, bottom: 30, width: 50, height: 50, justifyContent: "center", alignItems: "center" },

  categoryPill: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 30, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 15 },
  categoryItem: { paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "center" },
  selectedCategory: { backgroundColor: "#fff", borderRadius: 20 },
  categoryText: { marginLeft: 8, fontWeight: "bold", color: "#000" },

  infoCard: { position: "absolute", bottom: 120, left: 10, right: 10, backgroundColor: "#1a1a1a", padding: 16, borderRadius: 16 },
  infoText: { color: "#fff", fontSize: 16, marginBottom: 4 },

  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionText: { color: "white", textAlign: "center", marginBottom: 12, fontSize: 16 },
  permissionButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#1e90ff", borderRadius: 8 },
  permissionButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
