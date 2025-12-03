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
  BackHandler,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";
import { router, useFocusEffect } from "expo-router";
import { GetUserDetails } from "@/api/UserDataEndpoint";
import { Meal } from "@/models/Meals";
import database from "@/database/database";
import { getUserIdFromToken } from "@/api/TokenDecoder";
import { AIEndpoint } from "@/api/AIEndpoint";
import { SavedMessage } from "@/models/SavedMessage";
import { BlurView } from "expo-blur";

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
  "Make a personalized workout plan",
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
  const [showSavedMessages, setShowSavedMessages] = useState(false);
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [selectedMessageToSave, setSelectedMessageToSave] = useState<Message | null>(null);
  const [greetingMessage] = useState(() => 
    GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)]
  );
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const emojiAnimX = useRef(new Animated.Value(0)).current;
  const emojiAnimY = useRef(new Animated.Value(0)).current;

  // Handle back button/gesture to go to workout tab
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        router.replace("/(tabs)/workout");
        return true; // Prevent default back behavior
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

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
    if (hasNutrition && hasFitness) return "nutrition"; // prioritize nutrition if both
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

  const loadSavedMessages = async () => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) return;
      
      const saved = await SavedMessage.getSavedMessages(database, userId);
      setSavedMessages(saved);
    } catch (error) {
      console.error("Error loading saved messages:", error);
    }
  };

  const toggleSavedMessages = async () => {
    if (!showSavedMessages) {
      await loadSavedMessages();
    }
    setShowSavedMessages(!showSavedMessages);
  };

  const saveMessage = async (message: Message) => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      await SavedMessage.saveMessage(
        database,
        userId,
        message.text,
        message.isUser ? 'user' : 'ai'
      );
      
      await loadSavedMessages();
      setSelectedMessageToSave(null);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const deleteSavedMessage = async (messageId: string) => {
    try {
      await SavedMessage.deleteMessage(database, messageId);
      await loadSavedMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const parseTableResponse = (text: string) => {
    const tableStart = text.indexOf("STARTTABLE");
    const tableEnd = text.indexOf("ENDTABLE");
    
    if (tableStart === -1 || tableEnd === -1) {
      return <Text style={styles.messageText}>{text}</Text>;
    }

    const beforeTable = text.substring(0, tableStart).trim();
    const tableContent = text.substring(tableStart + 10, tableEnd).trim();
    const afterTable = text.substring(tableEnd + 8).trim();
    
    // Split by newlines to get rows
    const rows = tableContent.split(/\n/).filter(row => row.trim());
    
    return (
      <>
        {beforeTable && <Text style={styles.messageText}>{beforeTable}</Text>}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tableScrollView}
        >
          <View style={styles.tableContainer}>
            {rows.map((row, rowIndex) => {
              // Split by | to get columns
              const columns = row.split('|').map(col => col.trim()).filter(col => col);
              
              const isHeaderRow = rowIndex === 0;
              
              return (
                <View key={rowIndex} style={styles.tableRow}>
                  {columns.map((column, colIndex) => (
                    <View 
                      key={colIndex} 
                      style={[
                        styles.tableCell,
                        isHeaderRow && styles.tableHeaderCell,
                        colIndex === 0 && styles.tableFirstColumn,
                      ]}
                    >
                      <Text 
                        style={[
                          styles.tableCellText,
                          isHeaderRow && styles.tableHeaderText,
                        ]}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {column}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>
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
      // Detect message category and get contextual data
      const category = detectMessageCategory(textToSend);
      const contextData = await getContextualData(category);
      
      // Build the question with context
      let questionWithContext = textToSend;
      if (contextData) {
        const contextString = JSON.stringify(contextData, null, 2);
        questionWithContext = `${textToSend}\n\nUser Context:\n${contextString}`;
      }
      
      // Debug: Log the request being sent
      console.log('Sending chat request with question:', questionWithContext);
      
      // Call backend API
      const response: any = await AIEndpoint.askChat(questionWithContext);
      
      // Handle both lowercase and uppercase 'answer' property
      const answerText = response.answer || response.Answer || "Sorry, I couldn't process that.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: answerText || "Sorry, I couldn't process that.",
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

  const renderMessage = ({ item }: { item: Message }) => {
    // Check if message contains a table
    const hasTable = item.text.includes("STARTTABLE");
    
    return (
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
              ? styles.userBubble
              : styles.aiBubble,
            !item.isUser && hasTable && styles.messageBubbleWide,
          ]}
        >
          {item.isUser ? (
            <Text style={styles.userMessageText}>
              {highlightKeywords(item.text)}
            </Text>
          ) : (
            parseTableResponse(item.text)
          )}
        </View>
        {!item.isUser && (
          <TouchableOpacity
            style={styles.saveMessageButton}
            onPress={() => saveMessage(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="bookmark-outline" size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Conditional wrapper component
  
  return (
    <>
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
              onPress={() => router.replace("/(tabs)/workout")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={theme.textColor} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Coach</Text>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={toggleSavedMessages}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="bookmark" 
                size={24} 
                color={theme.textColor} 
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
                  <Text style={styles.thinkingText}>
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
                <BlurView
                  key={index}
                  intensity={20}
                  tint="light"
                  style={styles.suggestionChip}
                >
                  <TouchableOpacity
                    onPress={() => sendMessage(question)}
                    activeOpacity={0.7}
                    style={styles.suggestionChipInner}
                  >
                    <Text style={styles.suggestionText}>{question}</Text>
                  </TouchableOpacity>
                </BlurView>
              ))}
            </ScrollView>
          </View>

          {/* Input */}
          <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboardOpen]}>
            <BlurView
              intensity={30}
              tint="light"
              style={styles.inputWrapper}
            >
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
                  <MaterialCommunityIcons name="camera" size={18} color="#FFFFFF" />
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
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </KeyboardAvoidingView>

        {/* Saved Messages Modal */}
        <Modal
          visible={showSavedMessages}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSavedMessages(false)}
        >
          <BlurView intensity={90} tint="light" style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Saved Messages</Text>
                <TouchableOpacity
                  onPress={() => setShowSavedMessages(false)}
                  style={styles.modalCloseButton}
                >
                  <MaterialCommunityIcons name="close" size={24} color={theme.textColor} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={savedMessages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <BlurView intensity={20} tint="light" style={styles.savedMessageCard}>
                    <View style={styles.savedMessageContent}>
                      <View style={styles.savedMessageHeader}>
                        <MaterialCommunityIcons 
                          name={item.messageType === 'user' ? 'account' : 'robot'} 
                          size={20} 
                          color={item.messageType === 'user' ? theme.primary : theme.textColorSecondary} 
                        />
                        <Text style={styles.savedMessageDate}>
                          {new Date(item.savedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.savedMessageText}>{item.messageText}</Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteSavedMessage(item.id)}
                      >
                        <MaterialCommunityIcons name="delete" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                )}
                contentContainerStyle={styles.savedMessagesList}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No saved messages yet</Text>
                }
              />
            </View>
          </BlurView>
        </Modal>
      </BlurredBackground>
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
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.black,
    color: theme.textColor,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.border,
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
    color: theme.textColor,
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
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.primary,
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
  messageBubbleWide: {
    maxWidth: "95%",
  },
  userBubble: {
    backgroundColor: theme.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
  },
  messageText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
    lineHeight: 20,
  },
  userMessageText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  saveMessageButton: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
  },
  boldKeyword: {
    color: theme.textColor,
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestionChip: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
  },
  suggestionChipInner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 12,
    fontFamily: theme.medium,
    color: theme.textColor,
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
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginLeft: 40,
    borderWidth: 1,
    borderColor: theme.border,
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
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(224, 224, 224, 0.3)',
  },
  inputContainerKeyboardOpen: {
    paddingBottom: 10,
  },
  inputWrapper: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  input: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
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
    backgroundColor: theme.primary,
    borderRadius: 20,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: "#FFFFFF",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  tableScrollView: {
    marginTop: 8,
    marginBottom: 8,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  tableCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    width: 100,
  },
  tableHeaderCell: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 10,
  },
  tableFirstColumn: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    width: 80,
  },
  tableCellText: {
    fontSize: 11,
    fontFamily: theme.regular,
    color: "#fff",
    lineHeight: 14,
  },
  tableHeaderText: {
    fontFamily: theme.bold,
    fontSize: 12,
    color: "#fff",
  },
  // Keep old styles for backwards compatibility
  tablePill: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tablePillHeader: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
    minWidth: 80,
  },
  tablePillText: {
    fontSize: 13,
    fontFamily: theme.medium,
    color: "#fff",
  },
  tablePillHeaderText: {
    fontFamily: theme.bold,
    fontSize: 14,
    color: "#fff",
  },
  tablePillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(220, 220, 220, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
  },
  savedMessagesList: {
    padding: 16,
  },
  savedMessageCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
  },
  savedMessageContent: {
    padding: 16,
  },
  savedMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  savedMessageDate: {
    fontSize: 12,
    fontFamily: theme.regular,
    color: theme.textColorSecondary,
  },
  savedMessageText: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: theme.textColor,
    lineHeight: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.medium,
    color: theme.textColorSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
