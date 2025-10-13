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
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/constants/theme";
import ConditionalBlurView from "@/components/ui/ConditionalBlurView";
import GlassEffect from "@/components/ui/GlassEffect";
import MealCard from "@/components/ui/Nutrition/MealCard";
import CategoriesPicker, { CategoryItem } from "@/components/ui/CategoriesPicker";
import FadeTranslate from "@/components/ui/FadeTranslate";
import UndertextCard from "@/components/ui/UndertextCard";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import ScanResultModal from "@/components/ui/Nutrition/ScanResultModal";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalResult, setModalResult] = useState<any>(null);
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
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);

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
  const menuSnapPoints = useMemo(() => ['12%', '50%', '75%'], []);

  // Fetch today's meals from database
  const fetchTodayMeals = async () => {
    try {
      if (!database) {
        console.warn("Database not initialized yet");
        setTodayMeals([]);
        return;
      }
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("No user ID found, clearing meals");
        setTodayMeals([]);
        return;
      }
      
      // Fetch meals with user ID filter
      const meals = await Meal.getTodayMeals(database, userId);
      
      // Extra safety: filter out any meals that somehow don't match the current user
      const validMeals = meals.filter(meal => meal.userId === userId);
      
      setTodayMeals(validMeals);
      console.log(`Fetched ${validMeals.length} meals from today for user ${userId}`);
    } catch (error) {
      console.error("Error fetching today's meals:", error);
      // Set empty array on error to prevent UI issues
      setTodayMeals([]);
    }
  };

  // Fetch meals on mount
  useEffect(() => {
    fetchTodayMeals();
  }, []);

  // Log menu bottom sheet state changes
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
        
        // Save meal to database if it's a meal response
        if (selectedCategory === "Meal" && isMealResponse(aiMealResponse)) {
          try {
            await Meal.createMeal(database, {
              userId: userId,
              mealName: aiMealResponse.ShortMealName,
              calories: aiMealResponse.CaloriesAmount,
              protein: aiMealResponse.Protein,
              carbohydrates: aiMealResponse.Carbs,
              fats: aiMealResponse.Fat,
              label: aiMealResponse.MealQuality,
              createdAt: Date.now(),
              healthScore: aiMealResponse.HealthScoreOutOf10,
            });
            console.log("Meal saved to database successfully");
            // Refresh today's meals
            await fetchTodayMeals();
          } catch (error) {
            console.error("Error saving meal to database:", error);
          }
        }
        
        // Convert AI response to modal format
        let modalData: any = null;
        if (selectedCategory === "Meal" && isMealResponse(aiMealResponse)) {
          modalData = {
            type: "Meal",
            ...aiMealResponse,
          };
        } else if (selectedCategory === "Menu" && isMenuResponse(aiMealResponse)) {
          modalData = {
            type: "Menu",
            Meals: aiMealResponse.Meals,
          };
        } else if (selectedCategory === "Fridge" && isFridgeResponse(aiMealResponse)) {
          modalData = {
            type: "Fridge",
            Meals: aiMealResponse.Meals,
          };
        }
        
        setAiResponse(aiMealResponse);
        setModalResult(modalData);
        setCapturedPhoto(null); // Clear captured photo to restore camera
        setResizedPhoto(null); // Clear resized photo
        
        // Show modal with animation
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        setModalVisible(true);
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

  const handleCloseModal = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setModalVisible(false);
      setModalResult(null);
      setAiResponse(null);
    });
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
          <FadeTranslate order={2}>
          <ConditionalBlurView intensity={60} tint="dark" style={styles.permissionCard}>
            <MaterialCommunityIcons name="camera-outline" size={64} color="white" style={{ marginBottom: 16 }} />
            <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
            <Text style={styles.permissionText}>
              To scan your meals, we need access to your camera. Please grant permission to continue.
            </Text>
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
          <BottomSheetScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Title inside scroll view */}
            <View style={styles.menuTitleContainer}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#fff" style={styles.menuTitleIcon} />
              <Text style={[styles.infoTitle, styles.menuTitle]}>Today's Scanned Meals</Text>
            </View>
            
            {/* Display today's meals from database */}
            {todayMeals.length > 0 ? (
              todayMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  name={meal.mealName}
                  time={new Date(meal.createdAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                  calories={meal.calories}
                  protein={meal.protein}
                  carbs={meal.carbohydrates}
                  fat={meal.fats}
                  healthScore={meal.healthScore}
                />
              ))
            ) : (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderText}>No meals scanned today</Text>
                <Text style={styles.placeholderSubText}>Scan your first meal to get started!</Text>
              </View>
            )}
          </BottomSheetScrollView>
        </ConditionalBlurView>
      </BottomSheet>
    </GestureHandlerRootView>

    {/* Scan Result Modal */}
    <ScanResultModal
      visible={modalVisible}
      result={modalResult}
      onClose={handleCloseModal}
      fadeAnim={fadeAnim}
    />
  </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  cameraWrapper: { flex: 1 },
  topBar: {
    position: "absolute",
    top: Platform.OS === 'ios' ? Constants.statusBarHeight + 10 : 60,
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
    fontSize: 18,
    fontFamily: theme.bold,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 12,
    fontFamily: theme.regular,
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 25,
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
    paddingTop: 25,
  },
  menuTitleIcon: {
    marginRight: 8,
    marginTop: -10, // Slight adjustment to align with text baseline
  },
  infoSubtitle: { color: "#fff", fontSize: 18, fontFamily: theme.semibold, marginBottom: 4 },
  infoText: { color: "#ddd", fontSize: 16, fontFamily: theme.regular, marginBottom: 6, opacity: 0.9 },
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
  placeholderText: { color: "#fff", fontSize: 16, fontFamily: theme.semibold },
  placeholderSubText: { color: "#ddd", fontSize: 14, fontFamily: theme.regular, opacity: 0.8 },

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
    fontFamily: theme.bold,
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
    fontFamily: theme.bold,
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
    fontFamily: theme.regular,
    marginBottom: 2,
  },
  nutritionValue: {
    color: "#fff",
    fontFamily: theme.bold,
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
    fontFamily: theme.regular,
  },
  qualityValue: {
    color: theme.primary,
    fontFamily: theme.bold,
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
    fontFamily: theme.bold,
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
    fontFamily: theme.bold,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  ingredientsText: {
    color: "#ccc",
    fontSize: 14,
    fontFamily: theme.regular,
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
    fontFamily: theme.semibold,
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
    fontFamily: theme.regular,
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
    fontFamily: theme.bold,
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: theme.regular,
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
    fontFamily: theme.semibold,
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
    fontFamily: theme.semibold,
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
    backgroundColor: "#4caf50",
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
    fontFamily: theme.semibold,
    minWidth: 35,
  },
});