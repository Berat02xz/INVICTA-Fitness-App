import { useEffect } from "react";
import { router } from "expo-router";

export default function ChatbotTabIndex() {
  useEffect(() => {
    // Immediately redirect to the screens chatbot
    router.replace("/(screens)/ChatBot");
  }, []);

  return null;
}
