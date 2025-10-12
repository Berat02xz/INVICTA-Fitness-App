import SolidBackground from "@/components/ui/SolidBackground";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { router } from "expo-router";
import { GetUserDetails } from "@/api/UserDataEndpoint";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import { getUserIdFromToken } from "@/api/TokenDecoder";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const NUTRITION_KEYWORDS = ["meal", "nutrition", "food", "recipes", "eat", "diet", "calorie", "protein", "carbs", "fat", "hungry", "breakfast", "lunch", "dinner"];
const FITNESS_KEYWORDS = ["fitness", "workout", "gym", "exercise", "training", "muscle", "cardio", "strength", "run", "lift", "weight"];

const SUGGESTED_QUESTIONS = [
  "What should I eat for breakfast?",
  "Create a workout plan for me",
  "How many calories should I eat?",
  "Suggest healthy snacks",
  "Best exercises for weight loss",
  "High protein meal ideas",
];

const THINKING_MESSAGES = [
  "Thinking...",
  "Analyzing...",
  "Exercising a bit...",
  "Flexing my AI muscles...",
  "Brewing some knowledge...",
  "Almost there...",
  "Did you know that staying hydrated is crucial? 💧",
  "At this point, I'm just stalling... 🤔",
  "Damn, you're really making me think!",
  "Gang, I'm out of witty things to say...",
  "...",
  "Fuck",
  "Shit",
  "Damn",
  ":(",
  "Just close the app honestly"
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: "welcome",
        text: "Hi! I'm your AI fitness coach. Ask me anything about nutrition, workouts, or healthy living! 💪",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Rotate thinking messages while loading
  useEffect(() => {
    if (!isLoading) {
      setThinkingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setThinkingMessageIndex(prev => (prev + 1) % THINKING_MESSAGES.length);
      
      // Fade animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2700);

    return () => clearInterval(interval);
  }, [isLoading]);

  const detectMessageCategory = (text: string): "nutrition" | "fitness" | "general" => {
    const lowerText = text.toLowerCase();
    const hasNutrition = NUTRITION_KEYWORDS.some(keyword => lowerText.includes(keyword));
    const hasFitness = FITNESS_KEYWORDS.some(keyword => lowerText.includes(keyword));

    if (hasNutrition && !hasFitness) return "nutrition";
    if (hasFitness && !hasNutrition) return "fitness";
    if (hasNutrition && hasFitness) return "nutrition"; // Prioritize nutrition if both
    return "general";
  };

  const getContextualData = async (category: "nutrition" | "fitness" | "general") => {
    if (category === "general") return null;

    try {
      const userId = await getUserIdFromToken();
      if (!userId) return null;

      if (category === "nutrition") {
        const user = await GetUserDetails();
        const todayMeals = await Meal.getTodayMeals(database, userId);
        
        const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
        const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbohydrates, 0);
        const totalFats = todayMeals.reduce((sum, meal) => sum + meal.fats, 0);

        return {
          userWeight: user?.weight,
          userHeight: user?.height,
          bmr: user?.bmr,
          tdee: user?.tdee,
          dailyCalorieGoal: user?.caloricIntake,
          caloriesConsumedToday: totalCalories,
          caloriesRemaining: (user?.caloricIntake || 0) - totalCalories,
          proteinToday: Math.round(totalProtein),
          carbsToday: Math.round(totalCarbs),
          fatsToday: Math.round(totalFats),
          mealsToday: todayMeals.length,
          mealsList: todayMeals.map(m => m.mealName).join(", "),
          goal: user?.goal,
          activityLevel: user?.activityLevel,
          unit: user?.unit,
        };
      }

      if (category === "fitness") {
        const user = await GetUserDetails();
        return {
          userWeight: user?.weight,
          userHeight: user?.height,
          goal: user?.goal,
          fitnessLevel: user?.fitnessLevel,
          activityLevel: user?.activityLevel,
          equipmentAccess: user?.equipmentAccess,
          bmr: user?.bmr,
          tdee: user?.tdee,
          unit: user?.unit,
        };
      }
    } catch (error) {
      console.error("Error fetching contextual data:", error);
    }

    return null;
  };

  const highlightKeywords = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, "");
      const isNutrition = NUTRITION_KEYWORDS.includes(cleanWord);
      const isFitness = FITNESS_KEYWORDS.includes(cleanWord);

      if (isNutrition || isFitness) {
        return (
          <Text key={index} style={styles.boldKeyword}>
            {word}
          </Text>
        );
      }
      return <Text key={index}>{word}</Text>;
    });
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setShowSuggestions(false);
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Detect category and get contextual data
      const category = detectMessageCategory(textToSend);
      const contextData = await getContextualData(category);

      // TODO: Send to backend with context
      console.log("Message category:", category);
      console.log("Context data:", contextData);
      console.log("Message:", textToSend);

      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Response will appear here soon! Backend integration coming soon... 🚀`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 70000);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <MaterialCommunityIcons name="robot" size={20} color={theme.primary} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, item.isUser && styles.userMessageText]}>
          {item.isUser ? highlightKeywords(item.text) : item.text}
        </Text>
      </View>
      {item.isUser && (
        <View style={styles.userAvatar}>
          <MaterialCommunityIcons name="account" size={20} color="#fff" />
        </View>
      )}
    </View>
  );

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <MaterialCommunityIcons name="robot-happy" size={28} color={theme.primary} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>AI Fitness Coach</Text>
              <Text style={styles.headerSubtitle}>Always here to help</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <Animated.View style={[styles.thinkingContainer, { opacity: fadeAnim }]}>
                <Text style={styles.thinkingText}>
                  {THINKING_MESSAGES[thinkingMessageIndex]}
                </Text>
              </Animated.View>
            ) : null
          }
        />

        {/* Suggested Questions */}
        <View style={styles.suggestionsWrapper}>
          <Text style={styles.suggestionsTitle}>Suggested questions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}
          >
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => sendMessage(question)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: keyboardVisible ? 10 : 90 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything..."
              placeholderTextColor={theme.textColorSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="send"
                size={24}
                color={inputText.trim() ? "#fff" : theme.textColorSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.bold,
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(253, 14, 7, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: theme.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  messageText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: "#fff",
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  boldKeyword: {
    color: "#fff",
    fontFamily: theme.black,
  },
  thinkingContainer: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  thinkingText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: theme.primary,
    fontStyle: "italic",
  },
  suggestionsWrapper: {
    paddingVertical: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: theme.semibold,
    color: theme.textColorSecondary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: theme.medium,
    color: "#fff",
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    alignSelf: "flex-start",
    marginLeft: 40,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.textColorSecondary,
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: theme.backgroundColor,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.regular,
    color: "#fff",
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});
