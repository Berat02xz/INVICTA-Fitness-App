import { CheckToken } from "@/api/AxiosInstance";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import { GetUserDetails } from "@/api/UserDataEndpoint";
import RevenueCatService from "@/api/RevenueCatService";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { useEffect, useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { theme } from "@/constants/theme";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [revenueCatReady, setRevenueCatReady] = useState(false);
  
  const [fontsLoaded] = useFonts({
    Regular: require("../assets/fonts/Albert_Sans/static/AlbertSans-Regular.ttf"),
    Bold: require("../assets/fonts/Albert_Sans/static/AlbertSans-Bold.ttf"),
    Light: require("../assets/fonts/Albert_Sans/static/AlbertSans-Light.ttf"),
    Medium: require("../assets/fonts/Albert_Sans/static/AlbertSans-Medium.ttf"),
    SemiBold: require("../assets/fonts/Albert_Sans/static/AlbertSans-SemiBold.ttf"), 
    ExtraBold: require("../assets/fonts/Albert_Sans/static/AlbertSans-ExtraBold.ttf"),
    ExtraLight: require("../assets/fonts/Albert_Sans/static/AlbertSans-ExtraLight.ttf"),
    Thin: require("../assets/fonts/Albert_Sans/static/AlbertSans-Thin.ttf"),
    Black: require("../assets/fonts/Albert_Sans/static/AlbertSans-Black.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      (async () => {
        try {
          // Initialize RevenueCat
          await RevenueCatService.initialize();
          
          // Check if user is logged in and identify with RevenueCat
          try {
            const userId = await getUserIdFromToken();
            if (userId) {
              console.log('📱 User logged in, identifying with RevenueCat...');
              const userDetails = await GetUserDetails();
              await RevenueCatService.identifyUser(userId, {
                email: userDetails?.email,
                name: userDetails?.name,
              });
              console.log('✅ User identified with RevenueCat on app start');
            }
          } catch (identifyError) {
            console.log('ℹ️ No logged in user or identification failed');
          }
          
          setRevenueCatReady(true);
          
          // Check authentication token and navigate
          await CheckToken();
        } catch (error) {
          console.error("Initialization error:", error);
          // Continue even if RevenueCat fails
          setRevenueCatReady(true);
        }
      })();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || !revenueCatReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.primary }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
        <Toast />
      </GestureHandlerRootView>
    </>
  );
}
