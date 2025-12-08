import { setToken } from "@/api/AxiosInstance";
import { Login, FetchUserInformationAndStore, FetchUserMealsAndStore } from "@/api/UserDataEndpoint";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import Toast from "react-native-toast-message";
import BlurredBackground from "@/components/ui/BlurredBackground";
import FadeTranslate from "@/components/ui/FadeTranslate";

const { width } = Dimensions.get("window");

export const LoginScreen = () => {
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Rotation animation
  useEffect(() => {
    if (isLoading) {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoading]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  async function handleSubmit() {
    if (isLoading) return; // Prevent multiple submissions
    
    setIsLoading(true);
    try {
      const response = await Login({ email: Email, password: Password });
      if (!response || !response.token) {
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: "Login failed.",
        });
        return;
      } else {
        setToken(response.token);
        
        // Fetch and store user data in local database
        try {
          const userId = await getUserIdFromToken();
          if (userId) {
            console.log("🔐 Fetching user data for userId:", userId);
            await FetchUserInformationAndStore(userId);
            console.log("✅ User data fetched and stored successfully");
            
            // Fetch and store user meals
            try {
              console.log("🍽️ Fetching user meals...");
              await FetchUserMealsAndStore(userId);
              console.log("✅ User meals fetched and stored successfully");
            } catch (mealsError) {
              console.error("⚠️ Failed to fetch user meals, but login succeeded:", mealsError);
              // Don't block login if meals fetch fails
            }
          }
        } catch (userDataError) {
          console.error("⚠️ Failed to fetch user data, but login succeeded:", userDataError);
          // Don't block login if user data fetch fails
        }
        
        router.push("/(tabs)/workout");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const msg =
        error?.response?.data && typeof error.response.data === "string"
          ? error.response.data
          : "An unexpected error occurred. Please try again.";
      Toast.show({
        type: "error",
        text1: "Error",
        text2: msg,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BlurredBackground intensity={100} circleBlur={50} animationSpeed={1.5}>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <FadeTranslate order={1}>
            <Text style={styles.title}>Welcome Back!</Text>
          </FadeTranslate>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <FadeTranslate order={2}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={24}
              color={theme.textColor}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.buttonBorder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={Email}
              onChangeText={setEmail}
            />
          </View>
          </FadeTranslate>
          <FadeTranslate order={3}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color={theme.textColor}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholder="Password"
              placeholderTextColor={theme.buttonBorder}
              autoCapitalize="none"
              autoComplete="password"
              value={Password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color={theme.textColor}
              />
            </TouchableOpacity>
          </View>
          </FadeTranslate>
        </View>
          
        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Animated.View style={[
                  styles.loadingIcon,
                  { transform: [{ rotate: rotateInterpolate }] }
                ]}>
                  <Ionicons name="sync-outline" size={20} color="white" />
                </Animated.View>
                <Text style={styles.loginButtonText}>Logging in...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/WelcomeScreen")}>
            <Text style={styles.signupText}>You don't have an account?</Text>
          </TouchableOpacity>
        </View>
      </View>
      
    </BlurredBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontFamily: theme.bold,
    color: theme.textColor,
    textAlign: 'center',
  },
  formContainer: {
    width: width - 32,
    maxWidth: 350,
    gap: 20,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundColor,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 12,
    width: '100%',
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 5,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    height: theme.buttonHeight.lg,
    paddingHorizontal: 12,
    fontSize: theme.fontSize.lg,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
  eyeIcon: {
    padding: 10,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    width: width - 32,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    width: 333,
    height: theme.buttonHeight.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    marginBottom: 15,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: theme.fontSize.lg,
    fontFamily: theme.bold,
  },
  signupText: {
    color: theme.textColor,
    fontSize: theme.fontSize.sm,
    fontFamily: theme.medium,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;