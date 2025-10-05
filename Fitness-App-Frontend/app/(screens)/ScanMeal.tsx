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
import BlurredBackground from "@/components/ui/BlurredBackground";
import Constants from "expo-constants";
import { AIEndpoint } from "@/api/AIEndpoint";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import MealInfo from "@/components/ui/Nutrition/MealInfo";
import * as ImageManipulator from "expo-image-manipulator";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import Fontisto from '@expo/vector-icons/Fontisto';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/constants/theme";
import ConditionalBlurView from "@/components/ui/ConditionalBlurView";
import GlassEffect from "@/components/ui/GlassEffect";
import MealCard from "@/components/ui/Nutrition/MealCard";
import CategoriesPicker, { CategoryItem } from "@/components/ui/CategoriesPicker";
import FadeTranslate from "@/components/ui/FadeTranslate";
import UndertextCard from "@/components/ui/UndertextCard";

// Meal/AI types
export type MealInfoResponse = {
  isMeal: boolean;
  ShortMealName: string;
  CaloriesAmount: number;
  Protein: number;
  Carbs: number;
  Fat: number;
  MealQuality: string;
  HealthScoreOutOf10: number;
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

  const categories: CategoryItem[] = [
    { key: "Fridge", icon: "fridge-variant", label: "Scan Fridge" },
    { key: "Meal", icon: "food-outline", label: "Scan Meal" },
    { key: "Menu", icon: "menu-open", label: "Scan Menu" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("Meal");
  const [flash, setFlash] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanningAnim = useRef(new Animated.Value(0)).current;

  // Get subtitle based on selected category
  const getSubtitle = () => {
    switch (selectedCategory) {
      case "Meal":
        return "Scan meal to log";
      case "Fridge":
        return "Scan fridge to get meal ideas";
      case "Menu":
        return "Scan menu to analyze best meals";
      default:
        return "Scan to get started";
    }
  };

  // might not need memo, react compiler update
  const aiSnapPoints = useMemo(() => ['75%', '80%'], []);
  const menuSnapPoints = useMemo(() => ['12%', '50%', '75%'], []);

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
      <BlurredBackground intensity={70} circleBlur={100} animationSpeed={0.8}>
        {/* Back Button */}
        <FadeTranslate order={1}>
          <GlassEffect 
            intensity={40}
            tint="dark"
            style={styles.permissionBackButton}
          >
            <Pressable onPress={() => navigation.goBack()} style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
          </GlassEffect>
        </FadeTranslate>
        
        <View style={styles.permissionContainer}>
          {/* Permission Card */}
          <FadeTranslate order={2}>
          <ConditionalBlurView intensity={60} tint="dark" style={styles.permissionCard}>
            <MaterialCommunityIcons name="camera-outline" size={64} color="white" style={{ marginBottom: 16 }} />
            <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
            <Text style={styles.permissionText}>
              To scan your meals, we need access to your camera. Please grant permission to continue.
            </Text>
            {/* Grant Permission Button (no blur) */}
            <Pressable onPress={requestPermission} style={styles.permissionButton}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </Pressable>
          </ConditionalBlurView>
          </FadeTranslate>
          
          {/* Features You're Missing Out On */}
          <FadeTranslate order={3}>
            <UndertextCard 
              emoji="📸"
              title="Smart Meal Recognition"
              titleColor="white"
              text="Instantly identify your meals and log them with detailed nutritional information"
            />
          </FadeTranslate>
          
          <FadeTranslate order={4}>
            <UndertextCard 
              emoji="🥗"
              titleColor="white"
              title="Fridge Scanning"
              text="Get meal ideas by scanning your fridge contents and ingredients"
            />
          </FadeTranslate>
        </View>
      </BlurredBackground>
    );
  }

  return (
    <>
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
          <FadeTranslate order={1}>
          <View style={styles.topBar}>
            <GlassEffect variant="button" intensity={40} tint="dark">
              <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
              </Pressable>
            </GlassEffect>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Scanner</Text>
              <Text style={styles.subtitle}>{getSubtitle()}</Text>
            </View>
            <GlassEffect variant="button" intensity={40} tint="dark">
              <Pressable style={styles.menuButton} onPress={handleOpenMenu}>
                <MaterialCommunityIcons name="dots-horizontal" size={22} color="#fff" />
              </Pressable>
            </GlassEffect>
          </View>
          </FadeTranslate>
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
            <FadeTranslate order={2}>
            <CategoriesPicker
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            </FadeTranslate>
            {/* Flash and Snap Row */}
            <View style={styles.controlRow}>
              <FadeTranslate order={3}>
              <Pressable style={styles.flashButton} onPress={() => {
                console.log("Flash button pressed, current flash:", flash);
                setFlash(!flash);
              }}>
                {flash ? (
                  <Fontisto name="flash" size={24} color="#fff" />
                ) : (
                  <Ionicons name="flash-off-sharp" size={24} color="#fff" />
                )}
              </Pressable>
              </FadeTranslate>
              <FadeTranslate order={4}>
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
              </FadeTranslate>
              <View style={styles.placeholderButton}>
                <FadeTranslate order={5}>
                <MaterialCommunityIcons name="circle-outline" size={28} color="transparent" />
                </FadeTranslate>
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
          backgroundStyle={{ backgroundColor: "black" }}
          handleIndicatorStyle={styles.handleIndicator}
          containerStyle={styles.aiBottomSheetContainer}
        >
          <ConditionalBlurView intensity={60} tint="dark" style={styles.bottomSheetBackground}>
            <BottomSheetView style={styles.bottomSheetWrapper}>
              <View style={styles.bottomSheetContent}>
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
                    <>
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
                          
                          {/* Health Score Progress Bar */}
                          <View style={styles.healthScoreContainer}>
                            <Text style={styles.healthScoreLabel}>Health Score</Text>
                            <View style={styles.progressBarContainer}>
                              <View style={styles.progressBarBackground}>
                                <View 
                                  style={[
                                    styles.progressBarFill, 
                                    { width: `${(aiResponse.HealthScoreOutOf10 / 10) * 100}%` }
                                  ]} 
                                />
                              </View>
                              <Text style={styles.healthScoreText}>
                                {aiResponse.HealthScoreOutOf10}/10
                              </Text>
                            </View>
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
                    </>
                  )
                )}
                </Animated.View>
              </View>
            </BottomSheetView>
          </ConditionalBlurView>
        </BottomSheet>
      
      )}

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
        <ConditionalBlurView intensity={60} tint="dark" style={styles.bottomSheetBackground}>
          <BottomSheetView style={styles.bottomSheetWrapper}>
            <View style={[styles.bottomSheetContent, styles.menuBottomSheetContent]}>
              <View style={styles.menuTitleContainer}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#fff" style={styles.menuTitleIcon} />
                <Text style={[styles.infoTitle, styles.menuTitle]}>Today's Scanned Meals</Text>
              </View>
              
              {/* Realistic meal cards with detailed nutrition data */}
              <MealCard
                name="Apple Salmon salad..."
                time="9:00am"
                calories={500}
                protein={78}
                carbs={78}
                fat={70}
                healthScore={7}
              />

              <MealCard
                name="Quinoa Bowl"
                time="1:30pm"
                calories={380}
                protein={15}
                carbs={45}
                fat={12}
                healthScore={6}
                imageUrl="https://images.unsplash.com/photo-1484980972926-edee96e0960d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />

              <MealCard
                name="Avocado Toast"
                time="8:15am"
                calories={290}
                protein={8}
                carbs={22}
                fat={18}
                healthScore={9}
                imageUrl="https://images.unsplash.com/photo-1484980972926-edee96e0960d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
            </View>
          </BottomSheetView>
        </ConditionalBlurView>
      </BottomSheet>
    </GestureHandlerRootView>
  </>
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
  titleContainer: {
    alignItems: "center",
  },
  title: { 
    color: "#fff", 
    fontSize: 18, // Smaller font size
    fontWeight: "bold" 
  },
  subtitle: {
    color: "#ccc",
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.8,
    marginTop: 2,
  },
  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },

  focusGuideline: {
    position: "absolute",
    top: "20%", // Adjusted position
    left: "20%", // Centered more
    width: "60%", // Narrower width
    height: "40%", // Taller height (more vertical)
    opacity: 0.15, // Lower opacity
  },
  corner: { 
    width: 16, // Smaller corners
    height: 40, // Taller corners for vertical look
    borderColor: "#fff", 
    borderWidth: 2, // Thinner border
    borderRadius: 8, // Added border radius
    position: "absolute" 
  },
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

  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
  },
  snapButton: {
    width: 60, // Reduced from 70
    height: 60, // Reduced from 70
    borderRadius: 30, // Adjusted for new size
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)", // Add background for visibility
  },
  snapInner: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#fff" }, // Adjusted for new size
  flashButton: { 
    width: 46, // Slightly bigger
    height: 46, // Slightly bigger
    justifyContent: "center", 
    alignItems: "center",

  },
  placeholderButton: { width: 46, height: 46, justifyContent: "center", alignItems: "center" },

  bottomSheetBackground: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  bottomSheetWrapper: {
    flex: 1,
    width: '100%',
    alignItems: Platform.OS === 'web' ? 'center' : 'center', 
  },
  handleIndicator: { 
    backgroundColor: "#fff", 
    width: 40, 
    height: 4,
    borderRadius: 2,
    top: 25,
   },
  
   //if platform is web increase margins
  bottomSheetContent: { 
    flex: 1, 
    padding: 5, 
    width: Platform.OS === 'web' ? 500 : '90%', 
    maxWidth: Platform.OS === 'web' ? 500 : '100%', // Ensure max width constraint
  }, 
  menuBottomSheetContent: {
    marginHorizontal: 3,
    marginTop: 7,
  },
  infoTitle: { color: "#fff", fontSize: 22, fontFamily: theme.bold, marginBottom: 12 },
  menuTitle: { 
    marginTop: 0, // Reset margin since we're centering now
    textAlign: 'center', // Center the text
    fontSize: 18, // Smaller font size
  },
  menuTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  menuTitleIcon: {
    marginRight: 8,
    marginTop: -10, // Slight adjustment to align with text baseline
  },
  infoSubtitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 4 },
  infoText: { color: "#ddd", fontSize: 16, marginBottom: 6, opacity: 0.9 },
  bold: { fontFamily: theme.bold, color: "#fff" },
  mealItem: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },

  skeletonBlock: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 4,
    width: "80%",
  },

  menuSheetContent: {
    padding: 8, // Further reduced from 12 to 8 for more content space
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
  menuBottomSheetContainer: { zIndex: 25 }, // Lower than AI bottom sheet

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
    backgroundColor: "rgba(30,30,30,0.95)", // Darker background like the image
    borderRadius: 16,
    padding: 14, // Slightly reduced padding for better fit
    marginBottom: 12, // Reduced margin between cards
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  todayMealContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  todayMealImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: "rgba(76,175,80,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  todayMealImagePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover' as const,
  },
  todayMealInfo: {
    flex: 1,
  },
  todayMealHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  todayMealName: {
    color: "#fff",
    fontFamily: theme.bold,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  todayMealTime: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: theme.regular,
  },
  todayCaloriesDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  todayCaloriesIcon: {
    marginRight: 4,
  },
  todayCaloriesText: {
    color: "#fff",
    fontSize: 14, // Increased from 12 to 14
    fontFamily: theme.semibold,
  },
  todayNutritionRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 16, // Increased gap for better separation
    marginTop: 4,
  },
  todayNutritionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3, // Reduced gap between icon and text for tighter fit
  },
  todayNutritionIcon: {
    marginRight: 4,
  },
  todayNutritionValue: {
    color: "#fff",
    fontSize: 12,
    fontFamily: theme.medium,
  },
  // Health Score styles
  todayHealthScore: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  todayHealthIcon: {
    marginRight: 4,
  },
  todayHealthText: {
    color: "#aaa",
    fontSize: 11,
    fontFamily: theme.regular,
    marginRight: 6,
  },
  todayHealthProgressContainer: {
    flex: 1,
    marginHorizontal: 2,
    justifyContent: "center",
  },
  todayHealthProgressBackground: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  todayHealthProgressFill: {
    height: "100%",
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  todayHealthNumber: {
    color: "#fff",
    fontSize: 12,
    fontFamily: theme.bold,
    marginLeft: 6,
  },
  todayHealthTotal: {
    color: "#777",
    fontSize: 11,
    fontFamily: theme.light,
    opacity: 0.7,
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
  
  // Permission Screen Styles
  permissionBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    borderRadius: 15,
    padding: 12,
  },
  backButtonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  permissionContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionCard: {
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
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.9,
  },
  permissionButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Health Score Progress Bar Styles
  healthScoreContainer: {
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  healthScoreLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: theme.primary,
    borderRadius: 6,
    minWidth: 4,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  healthScoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    minWidth: 35,
  },
});