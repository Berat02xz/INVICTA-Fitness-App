import { loadToken } from "@/api/axiosInstance";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Regular": require("../assets/fonts/futura-now-headline/FuturaNowHeadline.ttf"),
    "Bold": require("../assets/fonts/futura-now-headline/FuturaNowHeadlineBold.ttf"),
    "Light": require("../assets/fonts/futura-now-headline/FuturaNowHeadlineLight.ttf"),
    "Black": require("../assets/fonts/futura-now-headline/FuturaNowHeadlineBlack.ttf"),
    "Medium": require("../assets/fonts/futura-now-headline/FuturaNowHeadlineMedium.ttf"),
    "ExtraBold": require("../assets/fonts/futura-now-headline/FuturaNowHeadlineExtraBold.ttf"),
    "ExtraLight": require("../assets/fonts/futura-now-headline/FuturaNowHeadlineExtraLight.ttf"),
    "Thin": require("../assets/fonts/futura-now-headline/FuturaNowHeadlineThin.ttf"),
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
