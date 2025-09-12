import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
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
import { Ionicons } from "@expo/vector-icons";
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

// Create a helper component for conditional blur
const ConditionalBlurView = ({ children, style, intensity = 60, tint = "dark" }) => {
  if (Platform.OS === 'android') {
    return (
      <View style={[style, { backgroundColor: 'rgba(20, 20, 20, 0.95)' }]}>
        {children}
      </View>
    );
  }
  return (
    <BlurView intensity={intensity} tint={tint} style={style}>
      {children}
    </BlurView>
  );
};

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
  const [isScanning, setIsScanning] = useState(false);
  const scanningAnim = useRef(new Animated.Value(0)).current;

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
    if (index === -1) {
      setAiResponse(null);
      setCapturedPhoto(null);
      setResizedPhoto(null);
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
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

  // Scanning animation
  useEffect(() => {
    if (isScanning) {
      // Fade in first
      Animated.timing(scanningAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        // Then start the pulsing loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(scanningAnim, {
              toValue: 0.4,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(scanningAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    } else {
      // Fade out when stopping
      Animated.timing(scanningAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [isScanning]);

  const takePhoto = async () => {
    console.log("takePhoto function called");
    if (!cameraRef.current) {
      console.warn("Camera ref is not available");
      return;
    }
    try {
      console.log("Starting photo capture...");
      setIsCapturing(true);
      setIsLoading(true);
      setIsScanning(true); // Start scanning animation
      
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
      setIsScanning(false); // Stop scanning animation
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
        <ConditionalBlurView intensity={60} tint="dark" style={styles.permissionCard}>
          <MaterialCommunityIcons name="camera-off" size={64} color={theme.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
          <Text style={styles.permissionText}>
            To scan your meals, we need access to your camera. Please grant permission to continue.
          </Text>
          {/* Grant Permission Button (no blur) */}
          <Pressable onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </ConditionalBlurView>
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
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
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

            {/* Flash and Snap Row */}
            <View style={styles.controlRow}>
              <Pressable style={styles.flashButton} onPress={() => {
                console.log("Flash button pressed, current flash:", flash);
                setFlash(!flash);
              }}>
                <MaterialCommunityIcons name={flash ? "flash" : "flash-off"} size={28} color="#fff" />
              </Pressable>
              <Pressable
                onPress={() => {
                  console.log("Snap button pressed");
                  takePhoto();
                }}
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

      {/* Bottom Sheet for AI Response (Calorie Card) */}
      {aiResponse && (
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={aiSnapPoints}
          index={0} // Show at first snap point when response exists
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          backgroundStyle={{ backgroundColor: "transparent" }}
          handleIndicatorStyle={styles.handleIndicator}
          containerStyle={styles.aiBottomSheetContainer}
        >
          <ConditionalBlurView intensity={60} tint="dark" style={styles.bottomSheetBackground}>
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
                        <View style={styles.mealCard}>
                          <View style={styles.mealHeader}>
                            <View style={styles.caloriesBadge}>
                              <Text style={styles.caloriesText}>{aiResponse.CaloriesAmount} kcal</Text>
                            </View>
                          </View>
                          <Text style={styles.infoTitle}>🍽️ {aiResponse.ShortMealName}</Text>
                          <View style={styles.nutritionGrid}>
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionIcon}>💪</Text>
                              <Text style={styles.nutritionLabel}>Protein</Text>
                              <Text style={styles.nutritionValue}>{aiResponse.Protein}g</Text>
                            </View>
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionIcon}>🍞</Text>
                              <Text style={styles.nutritionLabel}>Carbs</Text>
                              <Text style={styles.nutritionValue}>{aiResponse.Carbs}g</Text>
                            </View>
                            <View style={styles.nutritionItem}>
                              <Text style={styles.nutritionIcon}>🧈</Text>
                              <Text style={styles.nutritionLabel}>Fat</Text>
                              <Text style={styles.nutritionValue}>{aiResponse.Fat}g</Text>
                            </View>
                          </View>
                          <View style={styles.qualityContainer}>
                            <Text style={styles.qualityLabel}>Quality Rating:</Text>
                            <Text style={styles.qualityValue}>{aiResponse.MealQuality}</Text>
                          </View>
                        </View>
                      )}
                      {selectedCategory === "Menu" && isMenuResponse(aiResponse) && (
                        <View style={styles.menuCard}>
                          <Text style={styles.infoTitle}>📋 Menu Items</Text>
                          {aiResponse.Meals.map((meal, idx) => (
                            <View key={idx} style={styles.menuItem}>
                              <View style={styles.menuItemHeader}>
                                <Text style={styles.menuItemName}>{meal.MenuName}</Text>
                                <View style={styles.caloriesBadgeSmall}>
                                  <Text style={styles.caloriesTextSmall}>{meal.Calories} kcal</Text>
                                </View>
                              </View>
                              <Text style={styles.ingredientsText}>
                                🥦 {meal.Ingredients.join(" • ")}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {selectedCategory === "Fridge" && isFridgeResponse(aiResponse) && (
                        <View style={styles.fridgeCard}>
                          <Text style={styles.infoTitle}>🧊 Fridge Suggestions</Text>
                          {aiResponse.Meals.map((meal, idx) => (
                            <View key={idx} style={styles.fridgeItem}>
                              <View style={styles.fridgeItemHeader}>
                                <Text style={styles.fridgeItemName}>{meal.Meal}</Text>
                                <View style={styles.caloriesBadgeSmall}>
                                  <Text style={styles.caloriesTextSmall}>{meal.Calories} kcal</Text>
                                </View>
                              </View>
                              <Text style={styles.ingredientsText}>
                                🥦 {meal.Ingredients.join(" • ")}
                              </Text>
                              <View style={styles.timeContainer}>
                                <Text style={styles.timeIcon}>⏱️</Text>
                                <Text style={styles.timeText}>{meal.TimeToMake}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </MealInfo>
                  )
                )}
              </Animated.View>
            </BottomSheetView>
          </ConditionalBlurView>
        </BottomSheet>
      )}

      {/* Unified Menu Bottom Sheet for Today's Scanned Meals - appears on both permission and camera screens */}
      <BottomSheet
        ref={menuBottomSheetRef}
        snapPoints={menuSnapPoints}
        index={0} // Start at minimal height (10%)
        onChange={handleMenuSheetChanges}
        enablePanDownToClose={false} // Prevent full closing
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleIndicatorStyle={styles.handleIndicator}
        containerStyle={styles.menuBottomSheetContainer} // Lower zIndex than AI response
      >
        <ConditionalBlurView intensity={60} tint="dark" style={styles.bottomSheetBackground}>
          <BottomSheetView style={[styles.bottomSheetContent, styles.menuBottomSheetContent]}>
            <View style={styles.menuSheetContent}>
              <Text style={[styles.infoTitle, styles.menuTitle]}>📅 Today's Scanned Meals</Text>
              
              {/* Realistic meal cards with detailed nutrition data */}
              <View style={styles.todayMealCard}>
                <View style={styles.todayMealHeader}>
                  <Text style={styles.todayMealName}>Grilled Chicken Salad</Text>
                  <View style={styles.caloriesBadgeSmall}>
                    <Text style={styles.caloriesTextSmall}>420 kcal</Text>
                  </View>
                </View>
                <View style={styles.todayNutritionRow}>
                  <View style={styles.todayProteinPill}>
                    <Text style={styles.todayProteinText}>35g</Text>
                  </View>
                  <View style={styles.todayCarbsPill}>
                    <Text style={styles.todayCarbsText}>12g</Text>
                  </View>
                  <View style={styles.todayFatPill}>
                    <Text style={styles.todayFatText}>18g</Text>
                  </View>
                </View>
                <View style={styles.todayTimeContainer}>
                  <Ionicons name="time-outline" size={14} color="#aaa" style={styles.todayTimeIcon} />
                  <Text style={styles.todayTimeText}>2 hours ago</Text>
                </View>
              </View>

              <View style={styles.todayMealCard}>
                <View style={styles.todayMealHeader}>
                  <Text style={styles.todayMealName}>Quinoa Bowl</Text>
                  <View style={styles.caloriesBadgeSmall}>
                    <Text style={styles.caloriesTextSmall}>380 kcal</Text>
                  </View>
                </View>
                <View style={styles.todayNutritionRow}>
                  <View style={styles.todayProteinPill}>
                    <Text style={styles.todayProteinText}>15g</Text>
                  </View>
                  <View style={styles.todayCarbsPill}>
                    <Text style={styles.todayCarbsText}>45g</Text>
                  </View>
                  <View style={styles.todayFatPill}>
                    <Text style={styles.todayFatText}>12g</Text>
                  </View>
                </View>
                <View style={styles.todayTimeContainer}>
                  <Ionicons name="time-outline" size={14} color="#aaa" style={styles.todayTimeIcon} />
                  <Text style={styles.todayTimeText}>5 hours ago</Text>
                </View>
              </View>

              <View style={styles.todayMealCard}>
                <View style={styles.todayMealHeader}>
                  <Text style={styles.todayMealName}>Avocado Toast</Text>
                  <View style={styles.caloriesBadgeSmall}>
                    <Text style={styles.caloriesTextSmall}>290 kcal</Text>
                  </View>
                </View>
                <View style={styles.todayNutritionRow}>
                  <View style={styles.todayProteinPill}>
                    <Text style={styles.todayProteinText}>8g</Text>
                  </View>
                  <View style={styles.todayCarbsPill}>
                    <Text style={styles.todayCarbsText}>22g</Text>
                  </View>
                  <View style={styles.todayFatPill}>
                    <Text style={styles.todayFatText}>18g</Text>
                  </View>
                </View>
                <View style={styles.todayTimeContainer}>
                  <Ionicons name="time-outline" size={14} color="#aaa" style={styles.todayTimeIcon} />
                  <Text style={styles.todayTimeText}>8 hours ago</Text>
                </View>
              </View>
            </View>
          </BottomSheetView>
        </ConditionalBlurView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cameraWrapper: { flex: 1 },
  topBar: {
    position: "absolute",
    top: Constants.statusBarHeight + 25,
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
    opacity: 0.2,
  },
  corner: { width: 20, height: 50, borderColor: "#fff", borderWidth: 3, borderRadius: 3, position: "absolute" },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  bottomControls: {
    position: "absolute",
    bottom: 110, // Moved higher to avoid overlap with menu bottom sheet
    width: "100%",
    alignItems: "center",
    zIndex: 15, // Below bottom sheets but above background elements
  },
  categoryPill: {
    flexDirection: "row",
    borderRadius: 30, // Large enough for pill shape
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Add a subtle background for pill look
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    alignSelf: "center",
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCategory: {
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    backgroundColor: "rgba(255,255,255,0.1)", // Add background for visibility
  },
  snapInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff" },
  flashButton: { 
    width: 50, 
    height: 50, 
    justifyContent: "center", 
    alignItems: "center",

  },
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
  handleIndicator: { 
    backgroundColor: "#fff", 
    width: 40, 
    height: 4,
    borderRadius: 2,
    top: 25,
   },
  bottomSheetContent: { flex: 1, padding: 15 }, // Reduced from 30 to 20
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
    padding: 20,
  },
  placeholderCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  placeholderText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  placeholderSubText: { color: "#ddd", fontSize: 14, opacity: 0.8 },

  aiBottomSheetContainer: { zIndex: 30 }, // Highest zIndex - appears above everything
  menuBottomSheetContainer: { zIndex: 25 }, // High zIndex - appears above buttons but below AI sheet

  gradientShadow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200, // Taller to ensure visibility under the bottom sheet
    zIndex: 5, // Lower than everything else
  },
  // New card styles
  mealCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  menuCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  fridgeCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "center", // Center the calorie badge
    alignItems: "center",
    marginBottom: 16,
  },
  caloriesBadge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  caloriesText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  caloriesBadgeSmall: {
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  caloriesTextSmall: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  nutritionItem: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  nutritionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  nutritionLabel: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 2,
  },
  nutritionValue: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  qualityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    padding: 12,
  },
  qualityLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  qualityValue: {
    color: theme.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  menuItem: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  menuItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  menuItemName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  fridgeItem: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#00d4aa",
  },
  fridgeItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fridgeItemName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  ingredientsText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 6,
    padding: 8,
    alignSelf: "flex-start",
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  timeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  // Today's meal styles
  todayMealCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  todayMealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todayMealName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18, // Increased from 16
    flex: 1,
    marginRight: 8,
  },
  todayNutritionRow: {
    flexDirection: "row",
    justifyContent: "flex-start", // Align badges to left instead of stretching
    marginBottom: 12,
    gap: 8, // Increase gap between small badges
    flexWrap: "wrap", // Allow wrapping if needed
  },
  // Protein pill - Blue theme (smaller badge style)
  todayProteinPill: {
    backgroundColor: "rgba(66, 165, 245, 0.15)", // Light blue background
    borderRadius: 12, // Smaller radius for badge look
    paddingHorizontal: 8, // Reduced padding
    paddingVertical: 4, // Reduced padding
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(66, 165, 245, 0.3)",
    alignSelf: "flex-start", // Don't stretch
  },
  todayProteinText: {
    color: "#42A5F5", // Blue text
    fontSize: 9, // Smaller font for compact badges
    fontWeight: "600",
    textAlign: "center",
  },
  // Carbs pill - Orange theme (smaller badge style)
  todayCarbsPill: {
    backgroundColor: "rgba(255, 167, 38, 0.15)", // Light orange background
    borderRadius: 12, // Smaller radius for badge look
    paddingHorizontal: 8, // Reduced padding
    paddingVertical: 4, // Reduced padding
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 167, 38, 0.3)",
    alignSelf: "flex-start", // Don't stretch
  },
  todayCarbsText: {
    color: "#FFA726", // Orange text
    fontSize: 9, // Smaller font for compact badges
    fontWeight: "600",
    textAlign: "center",
  },
  // Fat pill - Green theme (smaller badge style)
  todayFatPill: {
    backgroundColor: "rgba(102, 187, 106, 0.15)", // Light green background
    borderRadius: 12, // Smaller radius for badge look
    paddingHorizontal: 8, // Reduced padding
    paddingVertical: 4, // Reduced padding
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(102, 187, 106, 0.3)",
    alignSelf: "flex-start", // Don't stretch
  },
  todayFatText: {
    color: "#66BB6A", // Green text
    fontSize: 9, // Smaller font for compact badges
    fontWeight: "600",
    textAlign: "center",
  },
  todayTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.6, // Lower opacity to de-emphasize
  },
  todayTimeIcon: {
    marginRight: 6,
  },
  todayTimeText: {
    color: "#aaa",
    fontSize: 12,
    fontStyle: "italic",
  },
});