import BlurredBackground from "@/components/ui/BlurredBackground";
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
import { AIEndpoint } from "@/api/AIEndpoint";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const NUTRITION_KEYWORDS = ["meal", "nutrition", "food", "recipes", "eat", "diet", "calorie", "protein", "carbs", "fat", "hungry", "breakfast", "lunch", "dinner"];
const FITNESS_KEYWORDS = ["fitness", "workout", "gym", "exercise", "training", "muscle", "cardio", "strength", "run", "lift", "weight"];

const SUGGESTED_QUESTIONS = [
  "15 min recipes",
  "Easy breakfast",
  "Make workout plan",
  "Healthy snacks",
  "Weight loss tips",
  "High protein meals",
];

const GREETING_MESSAGES = [
  { emoji: "💪", text: "Ask away!" },
  { emoji: "🏅", text: "Hey champ!" },
  { emoji: "🏃‍♂️", text: "What’s up?" },
  { emoji: "✨", text: "Ready?" },
  { emoji: "🚀", text: "Let’s go!" },
  { emoji: "💬", text: "Shoot!" },
  { emoji: "🥗", text: "What’s good?" },
  { emoji: "⚡", text: "Zap me!" },
  { emoji: "🏆", text: "You win!" },
  { emoji: "🧠", text: "Brain mode!" },
  { emoji: "🤖", text: "Hi there!" },
  { emoji: "🌟", text: "Shine on!" },
];



const THINKING_MESSAGES = [
  "Thinking...",
  "Analyzing...",
  "Exercising a bit...",
  "Flexing my AI muscles...",
  "Brewing some knowledge...",
  "Almost there...",
  "Remember stay hydrated 💧",
  "🤔",
  "Damn, you're really making me think!",
  "holdup...",
  "...",
  "This is taking longer than expected...",
  "so like whats up?",
  "hmmm...",
  ":( ",
  "Just try later again honestly",
  "🤷‍♂️",
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [thinkingMessageIndex, setThinkingMessageIndex] = useState(0);
  const [useBlurredBackground, setUseBlurredBackground] = useState(true);
  const [greetingMessage] = useState(() => 
    GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)]
  );
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const emojiAnimX = useRef(new Animated.Value(0)).current;
  const emojiAnimY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  // Rotate thinking messages while loading
  useEffect(() => {
    if (!isLoading) {
      setThinkingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setThinkingMessageIndex(prev => (prev + 1) % THINKING_MESSAGES.length);
      
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

  // Animate greeting emoji with random movements
  useEffect(() => {
    const animateEmoji = () => {
      const randomX = (Math.random() - 0.5) * 20; // -20 to 20
      const randomY = (Math.random() - 0.5) * 20; // -20 to 20
      const duration = 2000 + Math.random() * 100; // 2-3 seconds

      Animated.parallel([
        Animated.timing(emojiAnimX, {
          toValue: randomX,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(emojiAnimY, {
          toValue: randomY,
          duration: duration,
          useNativeDriver: true,
        }),
      ]).start(() => animateEmoji());
    };

    animateEmoji();
  }, []);

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

  const toggleBackground = () => {
    setUseBlurredBackground(prev => !prev);
  };

  const parseTableResponse = (text: string) => {
    const tableStart = text.indexOf("TABLE");
    const tableEnd = text.indexOf("ENDTABLE");
    
    if (tableStart === -1 || tableEnd === -1) {
      return <Text style={styles.messageText}>{text}</Text>;
    }

    const beforeTable = text.substring(0, tableStart);
    const tableContent = text.substring(tableStart + 5, tableEnd);
    const afterTable = text.substring(tableEnd + 8);
    
    const items = tableContent.split(';').map(item => item.trim()).filter(item => item);

    return (
      <>
        {beforeTable && <Text style={styles.messageText}>{beforeTable}</Text>}
        <View style={styles.tablePillsContainer}>
          {items.map((item, index) => (
            <View key={index} style={styles.tablePill}>
              <Text style={styles.tablePillText}>{item}</Text>
            </View>
          ))}
        </View>
        {afterTable && <Text style={styles.messageText}>{afterTable}</Text>}
      </>
    );
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
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Debug: Log the request being sent
      console.log('Sending chat request with question:', textToSend);
      
      // Call backend API
      const response: any = await AIEndpoint.askChat(textToSend);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.Answer || "Sorry, I couldn't process that.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      let errorText = "Sorry, I encountered an error. Please try again.";
      
      // Provide more specific error messages
      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          errorText = "Authentication error. Please log in again.";
        } else if (status === 500) {
          errorText = "Server error. The AI service might be temporarily unavailable.";
        } else if (status === 400) {
          errorText = "Invalid request. Please try rephrasing your question.";
        }
      } else if (error.message?.includes('timeout')) {
        errorText = "Request timed out. Please check your connection and try again.";
      } else if (error.message?.includes('Network')) {
        errorText = "Network error. Please check your internet connection.";
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
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
      <View
        style={[
          styles.messageBubble,
          item.isUser 
            ? (useBlurredBackground ? styles.userBubbleBlurred : styles.userBubble)
            : styles.aiBubble,
        ]}
      >
        {item.isUser ? (
          <Text style={[
            styles.messageText, 
            useBlurredBackground ? styles.userMessageTextBlurred : styles.userMessageText
          ]}>
            {highlightKeywords(item.text)}
          </Text>
        ) : (
          parseTableResponse(item.text)
        )}
      </View>
    </View>
  );

  return (
    <>
      {useBlurredBackground ? (
        <BlurredBackground>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.push("/(tabs)/workout")}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={toggleBackground}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons 
              name={useBlurredBackground ? "blur" : "blur-off"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Animated.Text 
                style={[
                  styles.greetingEmoji,
                  {
                    transform: [
                      { translateX: emojiAnimX },
                      { translateY: emojiAnimY },
                    ],
                  },
                ]}
              >
                {greetingMessage.emoji}
              </Animated.Text>
              <Text style={styles.greetingText}>{greetingMessage.text}</Text>
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <Animated.View style={[styles.thinkingContainer, { opacity: fadeAnim }]}>
                <Text style={[
                  styles.thinkingText,
                  useBlurredBackground && styles.thinkingTextBlurred
                ]}>
                  {THINKING_MESSAGES[thinkingMessageIndex]}
                </Text>
              </Animated.View>
            ) : null
          }
        />

        {/* Suggested Questions */}
        <View style={styles.suggestionsWrapper}>
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
        <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboardOpen]}>
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
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => router.push("/(screens)/ScanMeal")}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="camera" size={18} color="#fff" />
                <Text style={styles.uploadButtonText}>Scan Meal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={() => sendMessage()}
                disabled={!inputText.trim() || isLoading}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="arrow-up"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
          </KeyboardAvoidingView>
        </BlurredBackground>
      ) : (
        <>
          <SolidBackground style={StyleSheet.absoluteFill} />
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => router.push("/(tabs)/workout")}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={toggleBackground}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name={useBlurredBackground ? "blur" : "blur-off"} 
                  size={24} 
                  color="#fff" 
                />
              </TouchableOpacity>
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
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Animated.Text 
                    style={[
                      styles.greetingEmoji,
                      {
                        transform: [
                          { translateX: emojiAnimX },
                          { translateY: emojiAnimY },
                        ],
                      },
                    ]}
                  >
                    {greetingMessage.emoji}
                  </Animated.Text>
                  <Text style={styles.greetingText}>{greetingMessage.text}</Text>
                </View>
              }
              ListFooterComponent={
                isLoading ? (
                  <Animated.View style={[styles.thinkingContainer, { opacity: fadeAnim }]}>
                    <Text style={[
                      styles.thinkingText,
                      useBlurredBackground && styles.thinkingTextBlurred
                    ]}>
                      {THINKING_MESSAGES[thinkingMessageIndex]}
                    </Text>
                  </Animated.View>
                ) : null
              }
            />

            {/* Suggested Questions */}
            <View style={styles.suggestionsWrapper}>
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
            <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboardOpen]}>
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
                <View style={styles.inputActions}>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => router.push("/(screens)/ScanMeal")}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="camera" size={18} color="#fff" />
                    <Text style={styles.uploadButtonText}>Scan Meal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={() => sendMessage()}
                    disabled={!inputText.trim() || isLoading}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="arrow-up"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </>
      )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  greetingEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 24,
    fontFamily: theme.bold,
    color: "#fff",
    textAlign: "center",
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
  userBubbleBlurred: {
    backgroundColor: "transparent",
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
  userMessageTextBlurred: {
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
  thinkingTextBlurred: {
    color: "#fff",
  },
  suggestionsWrapper: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestionChip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  suggestionText: {
    fontSize: 12,
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
    paddingBottom: 15,
  },
  inputContainerKeyboardOpen: {
    paddingBottom: 10,
  },
  inputWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  input: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: "#fff",
    minHeight: 40,
    maxHeight: 80,
    marginBottom: 12,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uploadButton: {
    height: 40,
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 20,
    gap: 8,
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: "#fff",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  tablePillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tablePill: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tablePillText: {
    fontSize: 13,
    fontFamily: theme.medium,
    color: "#fff",
  },
});
