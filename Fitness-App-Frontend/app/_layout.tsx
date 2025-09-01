import { CheckToken } from "@/api/AxiosInstance";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { ActivityIndicator, View } from "react-native";
import { theme } from "@/constants/theme";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Regular: require("../assets/fonts/futura-now-headline/FuturaNowHeadline.ttf"),
    Bold: require("../assets/fonts/futura-now-headline/FuturaNowHeadlineBold.ttf"),
    Light: require("../assets/fonts/futura-now-headline/FuturaNowHeadlineLight.ttf"),
    Black: require("../assets/fonts/futura-now-headline/FuturaNowHeadlineBlack.ttf"),
    Medium: require("../assets/fonts/futura-now-headline/FuturaNowHeadlineMedium.ttf"),
    ExtraBold: require("../assets/fonts/futura-now-headline/FuturaNowHeadlineExtraBold.ttf"),
    ExtraLight: require("../assets/fonts/futura-now-headline/FuturaNowHeadlineExtraLight.ttf"),
    Thin: require("../assets/fonts/futura-now-headline/FuturaNowHeadlineThin.ttf"),
  
    // MONTSERRAT FONTS
    // "Regular": require("../assets/fonts/Montserrat/Montserrat-Medium.ttf"),
    // "Bold": require("../assets/fonts/Montserrat/Montserrat-Bold.ttf"),
    // "Light": require("../assets/fonts/Montserrat/Montserrat-Light.ttf"),
    // "Black": require("../assets/fonts/Montserrat/Montserrat-Black.ttf"),
    // "Medium": require("../assets/fonts/Montserrat/Montserrat-Medium.ttf"),
    // "ExtraBold": require("../assets/fonts/Montserrat/Montserrat-ExtraBold.ttf"),
    // "ExtraLight": require("../assets/fonts/Montserrat/Montserrat-ExtraLight.ttf"),
    // "Thin": require("../assets/fonts/Montserrat/Montserrat-Thin.ttf"),
  
  });

  useEffect(() => {
    if (fontsLoaded) {
      (async () => {
        await CheckToken();
      })();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.primary }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
        <Toast />
      </GestureHandlerRootView>
    </>
  );
}
