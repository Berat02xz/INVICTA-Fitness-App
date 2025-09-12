import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
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
import { useIsFocused, useNavigation } from "@react-navigation/native";
import SolidBackground from "@/components/ui/SolidBackground";
import Constants from "expo-constants";
import { AIEndpoint } from "@/api/AIEndpoint";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import MealInfo from "@/components/ui/Nutrition/MealInfo";
import * as ImageManipulator from "expo-image-manipulator";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/constants/theme";
import { BlurView } from "expo-blur";

// Meal/AI types
export type MealInfoResponse = {
  isMeal: boolean;
  ShortMealName: string;
  CaloriesAmount: number;
  Protein: number;
  Carbs: number;
  Fat: number;
  MealQuality: string;
};
export type MenuInfoResponse = {
  Meals: { MenuName: string; Calories: number; Ingredients: string[] }[];
};
export type FridgeInfoResponse = {
  Meals: { Meal: string; Calories: number; Ingredients: string[]; TimeToMake: string }[];
};
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
  const navigation = useNavigation();
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [resizedPhoto, setResizedPhoto] = useState<ImageManipulator.ImageResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const skeletonAnim = useRef(new Animated.Value(0.3)).current;
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const menuBottomSheetRef = useRef<BottomSheet>(null);

  const categories = [
    { key: "Fridge", icon: "fridge-outline" },
    { key: "Meal", icon: "food" },
    { key: "Menu", icon: "clipboard-text-outline" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("Meal");
  const [flash, setFlash] = useState(false);

  // might not need memo, react compiler update
  const aiSnapPoints = useMemo(() => ['50%', '75%'], []);
  const menuSnapPoints = useMemo(() => ['10%', '50%', '75%'], []);

  // bottom sheet starts closed on init
  useEffect(() => {
    bottomSheetRef.current?.close();
    console.log("AI bottom sheet initialized as closed");
  }, []);

  // Log bottom sheet state changes
  const handleSheetChanges = useCallback((index: number) => {
    console.log("AI Bottom Sheet Changed:", index);
  }, []);
  const handleMenuSheetChanges = useCallback((index: number) => {
    console.log("Menu Bottom Sheet Changed:", index);
  }, []);

  // Skeleton animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) {
      console.warn("Camera ref is not available");
      return;
    }
    try {
      setIsCapturing(true);
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
        base64: false,
        shutterSound: false,
      });
      setCapturedPhoto(photo);
      const smallPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        //if sending meal send it lowQ, if sending fridge or menu send it HQ
        [{ resize: { width: selectedCategory == "Meal" ? 256 : 512 } }], 
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      setResizedPhoto(smallPhoto);

      const mealImageFile = { uri: smallPhoto.uri, name: `photo_${Date.now()}.jpg`, type: "image/jpeg" };
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("No user ID found");
        return;
      }
      let aiMealResponse: AIResponse | null = null;
      try {
        aiMealResponse = await Promise.race([
          AIEndpoint.uploadMeal(userId, mealImageFile, selectedCategory),
          new Promise((_, reject) => setTimeout(() => reject(new Error("API Timeout")), 30000)),
        ]) as AIResponse;
      } catch (timeoutError) {
        console.warn("API call timed out, checking for response:", timeoutError);
      }
      if (aiMealResponse) {
        console.log("AI Response:", aiMealResponse);
        console.log("Selected category:", selectedCategory);
        console.log("Is Fridge Response:", isFridgeResponse(aiMealResponse));
        console.log("Is Menu Response:", isMenuResponse(aiMealResponse));
        console.log("Is Meal Response:", isMealResponse(aiMealResponse));
        console.log("Bottom sheet ref:", bottomSheetRef.current ? "exists" : "null");
        setAiResponse(aiMealResponse);
        setCapturedPhoto(null); // Clear captured photo to restore camera
        setResizedPhoto(null); // Clear resized photo
        setTimeout(() => {
          bottomSheetRef.current?.expand();
          console.log("Expanding AI bottom sheet after response");
        }, 100); // Slight delay to ensure bottom sheet is ready
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      } else {
        console.warn("No AI response received");
      }
    } catch (e) {
      console.warn("CATCH: Failed to take photo", e);
    } finally {
      setIsCapturing(false);
      setIsLoading(false);
    }
  };

  const handleCloseBottomSheet = () => {
    setAiResponse(null);
    setCapturedPhoto(null);
    setResizedPhoto(null);
    bottomSheetRef.current?.close();
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const handleOpenMenu = () => {
    console.log("Opening menu bottom sheet");
    menuBottomSheetRef.current?.expand();
  };

  const handleCloseMenu = () => {
    menuBottomSheetRef.current?.snapToIndex(0);
  };

  if (!permission?.granted) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SolidBackground style={StyleSheet.absoluteFill} />
        {/* Top Bar: Back & Menu Buttons */}
        <View style={styles.topBar}>
          <BlurView intensity={40} tint="dark" style={styles.glassButton}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
            </Pressable>
          </BlurView>
          <Text style={styles.title}>Scanner</Text>
          <BlurView intensity={40} tint="dark" style={styles.glassButton}>
            <Pressable style={styles.menuButton} onPress={handleOpenMenu}>
              <MaterialCommunityIcons name="menu" size={28} color="#fff" />
            </Pressable>
          </BlurView>
        </View>
        {/* Permission Card */}
        <BlurView intensity={60} tint="dark" style={styles.permissionCard}>
          <MaterialCommunityIcons name="camera-off" size={64} color={theme.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
          <Text style={styles.permissionText}>
            To scan your meals, we need access to your camera. Please grant permission to continue.
          </Text>
          {/* Grant Permission Button (no blur) */}
          <Pressable onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </BlurView>
        {/* Bottom Sheet for Menu (Today's Scanned Meals) */}
        <BottomSheet
          ref={menuBottomSheetRef}
          snapPoints={menuSnapPoints}
          index={0}
          onChange={handleMenuSheetChanges}
          enablePanDownToClose={false}
          backgroundStyle={{ backgroundColor: "transparent" }}
          handleIndicatorStyle={styles.handleIndicator}
          containerStyle={styles.menuBottomSheetContainer}
        >
          <BlurView intensity={60} tint="dark" style={styles.bottomSheetBackground}>
            <BottomSheetView style={[styles.bottomSheetContent, styles.menuBottomSheetContent]}>
              <View style={styles.menuSheetContent}>
                <Text style={[styles.infoTitle, styles.menuTitle]}>📅 Today's Scanned Meals</Text>
                <Text style={styles.infoText}>No meals scanned yet today.</Text>
                {[1, 2, 3].map((item) => (
                  <View key={item} style={styles.placeholderCard}>
                    <Text style={styles.placeholderText}>Meal {item}</Text>
                    <Text style={styles.placeholderSubText}>Placeholder for scanned meal</Text>
                  </View>
                ))}
              </View>
            </BottomSheetView>
          </BlurView>
        </BottomSheet>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

          {/* Top Bar */}
          <View style={styles.topBar}>
            <BlurView intensity={40} tint="dark" style={styles.glassButton}>
              <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
              </Pressable>
            </BlurView>
            <Text style={styles.title}>Scanner</Text>
            <BlurView intensity={40} tint="dark" style={styles.glassButton}>
              <Pressable style={styles.menuButton} onPress={handleOpenMenu}>
                <MaterialCommunityIcons name="menu" size={28} color="#fff" />
              </Pressable>
            </BlurView>
          </View>

          {/* Focus Guidelines */}
          <View style={styles.focusGuideline}>
            {["topLeft", "topRight", "bottomLeft", "bottomRight"].map((corner) => (
              <View key={corner} style={[styles.corner, styles[corner]]} />
            ))}
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Category Picker */}
            <BlurView intensity={40} tint="default" style={styles.categoryPill}>
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
            </BlurView>

            {/* Flash and Snap Row */}
            <View style={styles.controlRow}>
              <Pressable style={styles.flashButton} onPress={() => setFlash(!flash)}>
                <MaterialCommunityIcons name={flash ? "flash" : "flash-off"} size={28} color="#fff" />
              </Pressable>
              <Pressable
                onPress={takePhoto}
                style={[styles.snapButton, isCapturing && { opacity: 0.6 }]}
                disabled={isCapturing}
              >
                {isCapturing ? <ActivityIndicator color="#fff" /> : <View style={styles.snapInner} />}
              </Pressable>
              <View style={styles.placeholderButton}>
                <MaterialCommunityIcons name="circle-outline" size={28} color="transparent" />
              </View>
            </View>
          </View>

          {/* Gradient Shadow for Menu Bottom Sheet */}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)']}
            style={styles.gradientShadow}
          />
        </View>
      </View>

      {/* Bottom Sheet for Menu (Today's Scanned Meals) */}
      <BottomSheet
        ref={menuBottomSheetRef}
        snapPoints={menuSnapPoints}
        index={0} // Start at minimal height (10%)
        onChange={handleMenuSheetChanges}
        enablePanDownToClose={false} // Prevent full closing
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleIndicatorStyle={styles.handleIndicator}
        containerStyle={styles.menuBottomSheetContainer} // Lower zIndex
      >
        <BlurView intensity={60} tint="dark" style={styles.bottomSheetBackground}>
          <BottomSheetView style={[styles.bottomSheetContent, styles.menuBottomSheetContent]}>
            <View style={styles.menuSheetContent}>
              <Text style={[styles.infoTitle, styles.menuTitle]}>📅 Today's Scanned Meals</Text>
              <Text style={styles.infoText}>No meals scanned yet today.</Text>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.placeholderCard}>
                  <Text style={styles.placeholderText}>Meal {item}</Text>
                  <Text style={styles.placeholderSubText}>Placeholder for scanned meal</Text>
                </View>
              ))}
            </View>
          </BottomSheetView>
        </BlurView>
      </BottomSheet>

      {/* Bottom Sheet for AI Response (Calorie Card) */}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={aiSnapPoints}
        index={-1} // Closed initially
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleIndicatorStyle={styles.handleIndicator}
        containerStyle={styles.aiBottomSheetContainer} // Higher zIndex
      >
        <BlurView intensity={60} tint="dark" style={styles.bottomSheetBackground}>
          <BottomSheetView style={styles.bottomSheetContent}>
            <Animated.View style={{ opacity: fadeAnim, padding: 16 }}>
              {isLoading ? (
                <View>
                  <Animated.View style={[styles.skeletonBlock, { opacity: skeletonAnim, height: 24, marginBottom: 12 }]} />
                  {[1, 2, 3, 4, 5].map((_, idx) => (
                    <Animated.View
                      key={idx}
                      style={[styles.skeletonBlock, { opacity: skeletonAnim, height: 18, marginBottom: 6 }]}
                    />
                  ))}
                </View>
              ) : (
                aiResponse && (
                  <MealInfo>
                    {selectedCategory === "Meal" && isMealResponse(aiResponse) && (
                      <>
                        <Text style={styles.infoTitle}>🍽️ {aiResponse.ShortMealName}</Text>
                        <Text style={styles.infoText}>
                          🔥 Calories: <Text style={styles.bold}>{aiResponse.CaloriesAmount} kcal</Text>
                        </Text>
                        <Text style={styles.infoText}>
                          💪 Protein: <Text style={styles.bold}>{aiResponse.Protein} g</Text>
                        </Text>
                        <Text style={styles.infoText}>
                          🍞 Carbs: <Text style={styles.bold}>{aiResponse.Carbs} g</Text>
                        </Text>
                        <Text style={styles.infoText}>
                          🧈 Fat: <Text style={styles.bold}>{aiResponse.Fat} g</Text>
                        </Text>
                        <Text style={styles.infoText}>
                          🏷️ Label: <Text style={styles.bold}>{aiResponse.MealQuality}</Text>
                        </Text>
                      </>
                    )}
                    {selectedCategory === "Menu" && isMenuResponse(aiResponse) && (
                      <>
                        <Text style={styles.infoTitle}>📋 Menu Items</Text>
                        {aiResponse.Meals.map((meal, idx) => (
                          <View key={idx} style={styles.mealItem}>
                            <Text style={styles.infoSubtitle}>
                              🍲 {meal.MenuName} — <Text style={styles.bold}>{meal.Calories} kcal</Text>
                            </Text>
                            <Text style={styles.infoText}>🥦 Ingredients: {meal.Ingredients.join(", ")}</Text>
                          </View>
                        ))}
                      </>
                    )}
                    {selectedCategory === "Fridge" && isFridgeResponse(aiResponse) && (
                      <>
                        <Text style={styles.infoTitle}>🧊 Fridge Suggestions</Text>
                        {aiResponse.Meals.map((meal, idx) => (
                          <View key={idx} style={styles.mealItem}>
                            <Text style={styles.infoSubtitle}>
                              🍴 {meal.Meal} — <Text style={styles.bold}>{meal.Calories} kcal</Text>
                            </Text>
                            <Text style={styles.infoText}>🥦 Ingredients: {meal.Ingredients.join(", ")}</Text>
                            <Text style={styles.infoText}>
                              ⏱️ Time to Make: <Text style={styles.bold}>{meal.TimeToMake}</Text>
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
                  </MealInfo>
                )
              )}
            </Animated.View>
          </BottomSheetView>
        </BlurView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cameraWrapper: { flex: 1 },
  topBar: {
    position: "absolute",
    top: Constants.statusBarHeight + 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    zIndex: 10,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  glassButton: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    marginHorizontal: 2,
  },

  focusGuideline: {
    position: "absolute",
    top: "25%", // Moved higher
    left: "15%",
    width: "70%",
    height: "30%",
  },
  corner: { width: 30, height: 50, borderColor: "#fff", borderWidth: 3, borderRadius: 3, position: "absolute" },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  bottomControls: {
    position: "absolute",
    bottom: 100, // Moved higher to avoid overlap with menu bottom sheet
    width: "100%",
    alignItems: "center",
  },
  categoryPill: {
    flexDirection: "row",
    borderRadius: 30, // Keep rounded shape for pill
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCategory: {
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  categoryText: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "#000",
  },

  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
  },
  snapButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  snapInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff" },
  flashButton: { width: 50, height: 50, justifyContent: "center", alignItems: "center" },
  placeholderButton: { width: 50, height: 50, justifyContent: "center", alignItems: "center" },

  permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  permissionCard: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: 340,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  permissionTitle: {
    color: theme.primary,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  permissionText: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 18,
    fontSize: 16,
    opacity: 0.85,
  },
  permissionButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: theme.primary,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  bottomSheetBackground: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
  },
  handleIndicator: { backgroundColor: "#fff", width: 40, height:  4 },
  bottomSheetContent: { flex: 1, padding: 30 },
  menuBottomSheetContent: {
    marginHorizontal: 16, // Reduce width by adding horizontal margins
  },
  infoTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  menuTitle: { marginTop: -12 }, // Pull "Today's Scanned Meals" closer to the top edge
  infoSubtitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 4 },
  infoText: { color: "#ddd", fontSize: 16, marginBottom: 6, opacity: 0.9 },
  bold: { fontWeight: "bold", color: "#fff" },
  mealItem: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },

  skeletonBlock: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    width: "80%",
  },

  menuSheetContent: {
    padding: 8, // Reduced padding to bring content closer to top
  },
  placeholderCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  placeholderText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  placeholderSubText: { color: "#ddd", fontSize: 14, opacity: 0.8 },

  aiBottomSheetContainer: { zIndex: 20 }, // Higher zIndex to appear above menu bottom sheet
  menuBottomSheetContainer: { zIndex: 10 }, // Lower zIndex

  gradientShadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60, // Taller to ensure visibility under the bottom sheet
    zIndex: 9, // Below the menu bottom sheet (zIndex: 10)
  },
});