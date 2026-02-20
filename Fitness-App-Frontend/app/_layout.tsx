import { CheckToken } from "@/api/AxiosInstance";
import RevenueCatService from "@/api/RevenueCatService";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { ActivityIndicator, View, StatusBar, Platform } from "react-native";
import { theme } from "@/constants/theme";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import * as SystemUI from 'expo-system-ui';

export default function RootLayout() {
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
    // Set background color asap to prevent white flash
    const setBackground = async () => {
        if (Platform.OS === 'android') {
            await SystemUI.setBackgroundColorAsync("black");
        }
    };
    setBackground();

    if (fontsLoaded) {
      (async () => {
        await RevenueCatService.initialize();
        await CheckToken();
      })();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.backgroundColor }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: theme.backgroundColor,
    },
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
        <ThemeProvider value={navTheme}>
          <Slot />
          <Toast />
        </ThemeProvider>
      </GestureHandlerRootView>
    </>
  );
}
