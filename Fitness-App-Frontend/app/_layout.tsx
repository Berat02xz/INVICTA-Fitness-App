import { loadToken } from "@/api/axiosInstance";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-Light": require("../assets/fonts/Inter_18pt-Light.ttf"),
    "Inter-Black": require("../assets/fonts/Inter_18pt-Black.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_18pt-Medium.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
    "Inter-ExtraBold": require("../assets/fonts/Inter_18pt-ExtraBold.ttf"),
    "Inter-ExtraLight": require("../assets/fonts/Inter_18pt-ExtraLight.ttf"),
    "Inter-Thin": require("../assets/fonts/Inter_18pt-Thin.ttf"),
  });

  useEffect(() => {
    (async () => {
      await loadToken();
    })();
  }, []);

  return (
    <>
      <Slot />
      <Toast />
    </>
  );
}
