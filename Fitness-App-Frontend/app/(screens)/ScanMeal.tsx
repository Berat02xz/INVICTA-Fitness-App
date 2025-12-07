import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import BlurredBackground from "@/components/ui/BlurredBackground";
import Constants from "expo-constants";
import { AIEndpoint } from "@/api/AIEndpoint";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import Fontisto from '@expo/vector-icons/Fontisto';
import { theme } from "@/constants/theme";
import GlassEffect from "@/components/ui/GlassEffect";
import FadeTranslate from "@/components/ui/FadeTranslate";
import UndertextCard from "@/components/ui/UndertextCard";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import ScanResultModal from "@/components/ui/Nutrition/ScanResultModal";

// Focus Area Configuration (Centered with anchor point at middle)
const FOCUS_AREA = {
  WIDTH_PERCENT: 70,      // Width of focus area (%)
  HEIGHT_PERCENT: 50,     // Height of focus area (%)
  CORNER_SIZE: 20,        // Size of corner markers (px)
  CORNER_BORDER: 1,       // Border width of corners (px)
};

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
  OneEmoji: string;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalResult, setModalResult] = useState<any>(null);
  const [flash, setFlash] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanningAnim = useRef(new Animated.Value(0)).current;
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const infoFadeAnim = useRef(new Animated.Value(0)).current;

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
        [{ resize: { width: 256 } }], 
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );
      setResizedPhoto(smallPhoto);

      const mealImageFile = { uri: smallPhoto.uri, name: `photo_${Date.now()}.jpg`, type: "image/jpeg" };
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("No user ID found");
        return;
      }
      let aiMealResponse: MealInfoResponse | null = null;
      try {
        aiMealResponse = await Promise.race([
          AIEndpoint.uploadMeal(userId, mealImageFile),
          new Promise((_, reject) => setTimeout(() => reject(new Error("API Timeout")), 30000)),
        ]) as MealInfoResponse;
      } catch (timeoutError) {
        console.warn("API call timed out, checking for response:", timeoutError);
      }
      if (aiMealResponse) {
        console.log("AI Response:", aiMealResponse);
        
        // Save meal to database
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
            oneEmoji: aiMealResponse.OneEmoji,
          });
          console.log("Meal saved to database successfully");
        } catch (error) {
          console.error("Error saving meal to database:", error);
        }
        
        // Convert AI response to modal format
        const modalData = {
          type: "Meal",
          ...aiMealResponse,
        };
        
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
    });
  };

  const handleOpenInfoModal = () => {
    setInfoModalVisible(true);
    Animated.timing(infoFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const handleCloseInfoModal = () => {
    Animated.timing(infoFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setInfoModalVisible(false);
    });
  };

  const pickImageFromGallery = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access media library was denied');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log("Image selected from gallery:", selectedImage.uri);
        
        setIsCapturing(true);
        setIsLoading(true);
        setIsScanning(true);

        // Resize the image
        const smallPhoto = await ImageManipulator.manipulateAsync(
          selectedImage.uri,
          [{ resize: { width: 256 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        );
        setResizedPhoto(smallPhoto);

        const mealImageFile = { uri: smallPhoto.uri, name: `photo_${Date.now()}.jpg`, type: "image/jpeg" };
        const userId = await getUserIdFromToken();
        if (!userId) {
          console.warn("No user ID found");
          return;
        }

        let aiMealResponse: MealInfoResponse | null = null;
        try {
          aiMealResponse = await Promise.race([
            AIEndpoint.uploadMeal(userId, mealImageFile),
            new Promise((_, reject) => setTimeout(() => reject(new Error("API Timeout")), 30000)),
          ]) as MealInfoResponse;
        } catch (timeoutError) {
          console.warn("API call timed out, checking for response:", timeoutError);
        }

        if (aiMealResponse) {
          console.log("AI Response:", aiMealResponse);
          
          // Save meal to database
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
              oneEmoji: aiMealResponse.OneEmoji,
            });
            console.log("Meal saved to database successfully");
          } catch (error) {
            console.error("Error saving meal to database:", error);
          }
          
          // Convert AI response to modal format
          const modalData = {
            type: "Meal",
            ...aiMealResponse,
          };
          
          setModalResult(modalData);
          setResizedPhoto(null);
          
          // Show modal with animation
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
          setModalVisible(true);
        } else {
          console.warn("No AI response received");
        }
      }
    } catch (e) {
      console.warn("Failed to pick image from gallery", e);
    } finally {
      setIsCapturing(false);
      setIsLoading(false);
      setIsScanning(false);
    }
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
            <View style={styles.permissionCard}>
              <MaterialCommunityIcons name="camera-outline" size={64} color="white" style={{ marginBottom: 16 }} />
              <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
              <Text style={styles.permissionText}>
                To scan your meals, we need access to your camera. Please grant permission to continue.
              </Text>
              <Pressable onPress={requestPermission} style={styles.permissionButton}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </Pressable>
            </View>
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
        </View>
      </BlurredBackground>
    );
  }

  return (
    <>
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
                <Text style={styles.subtitle}>Scan meal to log</Text>
              </View>
              <GlassEffect variant="button" intensity={40} tint="dark">
                <Pressable style={styles.infoButton} onPress={handleOpenInfoModal}>
                  <MaterialCommunityIcons name="information-outline" size={22} color="#fff" />
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
            {/* Flash and Snap Row */}
            <View style={styles.controlRow}>
              <FadeTranslate order={3}>
                <Pressable style={styles.galleryButton} onPress={pickImageFromGallery}>
                  <MaterialCommunityIcons name="image-outline" size={28} color="#fff" />
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
              <FadeTranslate order={5}>
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
            </View>
          </View>
        </View>
      </View>

      {/* Scan Result Modal */}
      <ScanResultModal
        visible={modalVisible}
        result={modalResult}
        onClose={handleCloseModal}
        fadeAnim={fadeAnim}
      />

      {/* Info Modal */}
      {infoModalVisible && (
        <Animated.View style={[styles.infoModalOverlay, { opacity: infoFadeAnim }]}>
          <Pressable style={styles.infoModalBackdrop} onPress={handleCloseInfoModal} />
          <Animated.View style={[styles.infoModalContent, { opacity: infoFadeAnim, transform: [{ scale: infoFadeAnim }] }]}>
            <View style={styles.infoModalHeader}>
              <MaterialCommunityIcons name="information" size={32} color={theme.primary} />
              <Text style={styles.infoModalTitle}>How Scanning Works</Text>
            </View>
            
            <View style={styles.infoModalBody}>
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionIcon}>📸</Text>
                <View style={styles.infoSectionText}>
                  <Text style={styles.infoSectionTitle}>Smart Recognition</Text>
                  <Text style={styles.infoSectionDescription}>
                    Our AI analyzes your meal photo to identify ingredients and calculate nutritional values automatically.
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionIcon}>🔒</Text>
                <View style={styles.infoSectionText}>
                  <Text style={styles.infoSectionTitle}>Your Privacy</Text>
                  <Text style={styles.infoSectionDescription}>
                    Images are not stored in our database. However, they are processed and stored on OpenAI servers to improve their AI models, which this application has opted into.
                  </Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoSectionIcon}>⚡</Text>
                <View style={styles.infoSectionText}>
                  <Text style={styles.infoSectionTitle}>Quick & Easy</Text>
                  <Text style={styles.infoSectionDescription}>
                    Snap a photo or select from your gallery, and get instant nutritional information in seconds.
                  </Text>
                </View>
              </View>
            </View>

            <Pressable style={styles.infoModalCloseButton} onPress={handleCloseInfoModal}>
              <Text style={styles.infoModalCloseButtonText}>Got it</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" } as ViewStyle,
  cameraWrapper: { flex: 1 } as ViewStyle,
  topBar: {
    position: "absolute",
    top: Platform.OS === 'ios' ? Constants.statusBarHeight + 10 : 60,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    zIndex: 10,
  } as ViewStyle,
  titleContainer: {
    alignItems: "center",
  } as ViewStyle,
  title: { 
    color: "#fff", 
    fontSize: 18,
    fontFamily: theme.bold,
  } as TextStyle,
  subtitle: {
    color: "#ccc",
    fontSize: 12,
    fontFamily: theme.regular,
    opacity: 0.8,
    marginTop: 2,
  } as TextStyle,
  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  infoButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  
  focusGuideline: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: `${FOCUS_AREA.WIDTH_PERCENT}%`,
    height: `${FOCUS_AREA.HEIGHT_PERCENT}%`,
    marginTop: `-${FOCUS_AREA.HEIGHT_PERCENT / 2}%`,
    marginLeft: `-${FOCUS_AREA.WIDTH_PERCENT / 2}%`,
    zIndex: 2,
    transform: [{ translateY: -100 }], // Shift up more to center on screen
  } as ViewStyle,
  corner: { 
    width: FOCUS_AREA.CORNER_SIZE,
    height: FOCUS_AREA.CORNER_SIZE,
    borderColor: "#fff", 
    borderWidth: FOCUS_AREA.CORNER_BORDER,
    borderRadius: 4,
    position: "absolute" 
  } as ViewStyle,
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 } as ViewStyle,
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 } as ViewStyle,
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 } as ViewStyle,
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 } as ViewStyle,
  bottomControls: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
    zIndex: 15,
  } as ViewStyle,
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 40,
  } as ViewStyle,
  snapButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  } as ViewStyle,
  snapInner: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: "#fff" 
  } as ViewStyle,
  flashButton: { 
    width: 46,
    height: 46,
    justifyContent: "center", 
    alignItems: "center",
  } as ViewStyle,
  galleryButton: { 
    width: 46,
    height: 46,
    justifyContent: "center", 
    alignItems: "center",
  } as ViewStyle,
  placeholderButton: { 
    width: 46, 
    height: 46, 
    justifyContent: "center", 
    alignItems: "center" 
  } as ViewStyle,
  
  // Permission Screen Styles
  permissionBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    borderRadius: 15,
    padding: 12,
  } as ViewStyle,
  backButtonInner: {
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  permissionContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 20,
  } as ViewStyle,
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
    backgroundColor: "rgba(0,0,0,0.5)",
  } as ViewStyle,
  permissionTitle: {
    fontSize: 22,
    fontFamily: theme.bold,
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  } as TextStyle,
  permissionText: {
    fontSize: 16,
    fontFamily: theme.regular,
    color: "white",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.9,
  } as TextStyle,
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
  } as ViewStyle,
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.semibold,
    textAlign: "center",
  } as TextStyle,

  // Info Modal Styles
  infoModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  } as ViewStyle,
  infoModalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  } as ViewStyle,
  infoModalContent: {
    backgroundColor: "rgba(20, 20, 20, 0.98)",
    borderRadius: 24,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: "90%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  } as ViewStyle,
  infoModalHeader: {
    alignItems: "center",
    marginBottom: 24,
  } as ViewStyle,
  infoModalTitle: {
    fontSize: 22,
    fontFamily: theme.bold,
    color: "#fff",
    marginTop: 12,
    textAlign: "center",
  } as TextStyle,
  infoModalBody: {
    marginBottom: 24,
  } as ViewStyle,
  infoSection: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  } as ViewStyle,
  infoSectionIcon: {
    fontSize: 28,
    marginRight: 16,
    marginTop: 2,
  } as TextStyle,
  infoSectionText: {
    flex: 1,
  } as ViewStyle,
  infoSectionTitle: {
    fontSize: 16,
    fontFamily: theme.bold,
    color: "#fff",
    marginBottom: 6,
  } as TextStyle,
  infoSectionDescription: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  } as TextStyle,
  infoModalCloseButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  } as ViewStyle,
  infoModalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: theme.semibold,
  } as TextStyle,
});