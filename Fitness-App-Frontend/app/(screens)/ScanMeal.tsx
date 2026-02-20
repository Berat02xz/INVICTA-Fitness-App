import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { AIEndpoint } from "@/api/AIEndpoint";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import { theme } from "@/constants/theme";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import ScanResultModal from "@/components/ui/Nutrition/ScanResultModal";

const { width } = Dimensions.get("window");

// Scanner Frame Config
const FRAME_SIZE = width * 0.75;
const CORNER_LENGTH = 30;
const CORNER_WIDTH = 4;

export type MealInfoResponse = {
  isMeal: boolean;
  ShortMealName: string;
  CaloriesAmount: number;
  Protein: number;
  Carbs: number;
  Fat: number;
  MealQuality: string;
  HealthScoreOutOf10: number;
  OneEmoji: string;
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // State
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Processing AI
  const [flash, setFlash] = useState(false);
  
  // Animation Values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalResult, setModalResult] = useState<any>(null);

  // Meal Count State
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    fetchTodayCount();
  }, []);

  const fetchTodayCount = async () => {
    try {
        const userId = await getUserIdFromToken();
        if (userId) {
            const meals = await Meal.getTodayMeals(database, userId);
            setTodayCount(meals.length);
        }
    } catch {}
  };

  // Start/Stop Scanning Animation
  useEffect(() => {
    if (isFocused && !capturedPhoto) {
      startScanAnimation();
    } else {
      scanLineAnim.setValue(0);
    }
  }, [isFocused, capturedPhoto]);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const processImage = async (uri: string) => {
    setIsProcessing(true);
    // Fade in overlay to show "Processing" state
    Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    try {
      // 1. Resize/Compress
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400 } }], // Smaller size for faster upload
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 2. Prepare upload
      const mealImageFile = {
        uri: manipResult.uri,
        name: `meal_${Date.now()}.jpg`,
        type: "image/jpeg",
      };
      
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("User not found");

      // 3. AI Request with Timeout
      const aiMealResponse = await Promise.race([
        AIEndpoint.uploadMeal(userId, mealImageFile),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 25000)),
      ]) as MealInfoResponse;

      if (!aiMealResponse) throw new Error("No response from AI");

      // 4. Save to DB automatically (optional, depends on flow)
      // We'll just show the modal and let user confirm there? 
      // Current flow: Create immediately, then show modal.
      await Meal.createMeal(database, {
        userId,
        mealName: aiMealResponse.ShortMealName,
        calories: aiMealResponse.CaloriesAmount,
        protein: aiMealResponse.Protein,
        carbohydrates: aiMealResponse.Carbs,
        fats: aiMealResponse.Fat,
        label: aiMealResponse.MealQuality,
        createdAt: Date.now(),
        healthScore: aiMealResponse.HealthScoreOutOf10,
        oneEmoji: aiMealResponse.OneEmoji,
      });
      fetchTodayCount(); // Refresh count

      // 5. Show Result
      setModalResult({ type: "Meal", ...aiMealResponse });
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      setModalVisible(true);

    } catch (error) {
      console.log("Scan Error:", error);
      Alert.alert("Scan Failed", "Could not analyze the meal. Please try again.");
      setCapturedPhoto(null); // Reset to camera
    } finally {
      setIsProcessing(false);
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true, // Faster capture
      });
      setCapturedPhoto(photo);
      await processImage(photo.uri);
    } catch (e) {
      console.log(e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, 
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
        // Cast to any or conform to CameraCapturedPicture type to satisfy state
        const pickedAsset = result.assets[0];
        setCapturedPhoto({
          uri: pickedAsset.uri,
          width: pickedAsset.width,
          height: pickedAsset.height,
          // Add other props if strictly needed by CameraCapturedPicture, usually these suffice
        } as CameraCapturedPicture); 
        
        await processImage(pickedAsset.uri);
    }
  };

  const handleCloseModal = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setModalVisible(false);
      setModalResult(null);
      setCapturedPhoto(null);
    });
  };

  // Permission View
  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need camera access to scan your meals.</Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
           <Text style={{ color: "white", fontSize: 16 }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera Layer */}
      {isFocused && (
        <View style={StyleSheet.absoluteFill}>
            {!capturedPhoto ? (
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    flash={flash ? "on" : "off"}
                />
            ) : (
                <Image source={{ uri: capturedPhoto.uri }} style={StyleSheet.absoluteFill} />
            )}
        </View>
      )}

      {/* Dark Overlay with Transparent Hole (Visual trick for scanner focus) */}
      {/* We can use simple borders or a full overlay. Let's do a simple clean UI. */}
      
      {/* Top Bar */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
          <BlurView intensity={30} tint="dark" style={styles.blurIcon}>
            <Ionicons name="close" size={24} color="white" />
          </BlurView>
        </Pressable>
        
        {/* Status Pill Removed */}

        <View style={styles.countPill}>
            <BlurView intensity={30} tint="dark" style={styles.blurPillCount}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={14} color={theme.primary} />
                <Text style={styles.countText}>{todayCount} Today</Text>
            </BlurView>
        </View>
      </View>

      {/* Scanner Frame */}
      <View style={styles.centerFrameContainer} pointerEvents="none">
         <View style={styles.frame}>
            {/* Corners */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Scanning Line */}
            {!capturedPhoto && (
                <Animated.View 
                    style={[
                        styles.scanLine,
                        {
                            transform: [{
                                translateY: scanLineAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, FRAME_SIZE], // Move from top to bottom of frame
                                })
                            }]
                        }
                    ]} 
                />
            )}
         </View>
         
         {!isProcessing && !capturedPhoto && (
             <Text style={styles.hintText}>Place food within the frame</Text>
         )}
      </View>

      {/* Bottom Controls */}
      <View style={[styles.bottomBar, { bottom: insets.bottom + 30 }]}>
        {/* Gallery Pick */}
        <Pressable onPress={pickImage} style={styles.sideButton}>
            <MaterialCommunityIcons name="image-outline" size={28} color="white" />
        </Pressable>

        {/* Shutter Button */}
        <Pressable onPress={takePhoto} disabled={isProcessing} style={styles.shutterOuter}>
            <View style={[styles.shutterInner, isProcessing && { backgroundColor: theme.primary }]} />
        </Pressable>

        {/* Flash Toggle */}
        <Pressable onPress={() => setFlash(!flash)} style={styles.sideButton}>
            <Ionicons name={flash ? "flash" : "flash-off"} size={28} color={flash ? theme.primary : "white"} />
        </Pressable>
      </View>

      {/* Processing Overlay */}
      {isProcessing && (
          <Animated.View style={[styles.loadingOverlay, { opacity: overlayOpacity }]}>
              <BlurView intensity={40} tint="dark" style={styles.loadingBlur}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={styles.loadingText}>Analyzing Food...</Text>
              </BlurView>
          </Animated.View>
      )}

      {/* Result Modal */}
      <ScanResultModal
        visible={modalVisible}
        result={modalResult}
        imageUri={capturedPhoto?.uri}
        onClose={handleCloseModal}
        fadeAnim={fadeAnim}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: theme.medium,
  },
  permissionButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Top Bar
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  blurIcon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  statusPill: {
    borderRadius: 20,
    overflow: "hidden",
  },
  blurPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  statusText: {
    color: "white",
    fontFamily: theme.medium,
    fontSize: 14,
  },
  countPill: {
    borderRadius: 20,
    overflow: "hidden",
  },
  blurPillCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  countText: {
    color: "white",
    fontFamily: theme.bold,
    fontSize: 13,
  },

  // Center Frame
  centerFrameContainer: {
     ...StyleSheet.absoluteFillObject,
     justifyContent: "center",
     alignItems: "center",
     zIndex: 5,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
    borderColor: theme.primary, // or white
    borderWidth: CORNER_WIDTH,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  
  scanLine: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  hintText: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 20,
    fontSize: 14,
    fontFamily: theme.medium,
  },

  // Bottom Controls
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 10,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
  },
  sideButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  loadingBlur: {
    padding: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    gap: 15,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.semibold,
  },
});

