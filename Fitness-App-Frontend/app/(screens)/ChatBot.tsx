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
  Share,
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
  "Reasoning...",
  "Analyzing your data...",
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
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState("there");
  const [isReasoning, setIsReasoning] = useState(false);
  const [greetingMessage] = useState(() => 
    GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)]
  );
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const emojiAnimX = useRef(new Animated.Value(0)).current;
  const emojiAnimY = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Load user name and handle back button/gesture
  useFocusEffect(
    React.useCallback(() => {
      const loadUserName = async () => {
        try {
          const user = await GetUserDetails();
          if (user?.name) {
            setUserName(user.name.split(' ')[0]);
          }
        } catch (error) {
          console.error("Error loading user name:", error);
        }
      };

      loadUserName();

      const onBackPress = () => {
        router.replace("/(tabs)/workout");
        return true;
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

    // Start the spinning animation for the sync icon
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      })
    ).start();

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

    return () => {
      clearInterval(interval);
      spinAnim.setValue(0);
    };
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
      
      // Add message ID to saved set
      setSavedMessageIds(prev => new Set([...prev, message.id]));
      
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

  const handleShareMessage = async (message: Message) => {
    try {
      await Share.share({
        message: message.text,
        title: "Share AI Response",
      });
    } catch (error) {
      console.error("Error sharing message:", error);
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
        <View style={styles.messageBubbleWrapper}>
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
            <View style={styles.messageActionsContainer}>
              <TouchableOpacity
                style={styles.messageActionPill}
                onPress={() => handleShareMessage(item)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="share-variant" 
                  size={14} 
                  color={theme.textColor}
                />
                <Text style={styles.messageActionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageActionPill}
                onPress={() => saveMessage(item)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name={savedMessageIds.has(item.id) ? "bookmark" : "bookmark-outline"} 
                  size={14} 
                  color={theme.textColor}
                />
                <Text style={styles.messageActionText}>{savedMessageIds.has(item.id) ? "Saved" : "Save"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.replace("/(tabs)/workout")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={theme.textColor} />
            </TouchableOpacity>
            <TouchableOpacity 
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
                <Text style={styles.greetingText}>Hey {userName}, What are you looking for today?</Text>
              </View>
            }
            ListFooterComponent={
              isLoading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.resultsLabelContainer}>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: spinAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      }}
                    >
                      <MaterialCommunityIcons name="sync" size={16} color={theme.textColor} />
                    </Animated.View>
                    <Text style={styles.resultsText}>Results</Text>
                  </View>
                </View>
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
                  onPress={() => sendMessage(question)}
                  activeOpacity={0.7}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input */}
          <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboardOpen]}>
            <View
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
                  style={[styles.uploadButton, isReasoning && styles.uploadButtonReasoning]}
                  onPress={() => setIsReasoning(!isReasoning)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name={isReasoning ? "lightbulb" : "magnify"} 
                    size={16} 
                    color={isReasoning ? theme.primary : theme.textColor}
                  />
                  <Text style={[styles.uploadButtonText, isReasoning && styles.uploadButtonTextReasoning]}>
                    {isReasoning ? "Reasoning" : "Standard"}
                  </Text>
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
            </View>
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
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
    fontFamily: theme.medium,
    color: theme.textColor,
    textAlign: "center",
    marginBottom: 20,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 8,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  messageBubbleWrapper: {
    flex: 1,
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
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  messageBubbleWide: {
    width: "100%",
  },
  userBubble: {
    backgroundColor: '#F2F2F2',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 4,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
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
    color: theme.textColor,
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
  messageActionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
    paddingLeft: 16,
  },
  messageActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 220, 220, 0.5)',
  },
  messageActionText: {
    fontSize: 12,
    fontFamily: theme.medium,
    color: theme.textColor,
  },
  resultsLabel: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: theme.textColor,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boldKeyword: {
    fontSize: 14,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  thinkingContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  thinkingText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: "#747474ff",
    fontStyle: "italic",
  },
  suggestionsWrapper: {
    paddingTop: 0,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F7F7F7',
  },
  suggestionsScroll: {
    paddingHorizontal: 0,
    gap: 8,
    paddingVertical: 8,
  },
  suggestionChip: {
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  suggestionChipInner: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: theme.medium,
    color: theme.textColor,
  },
  loadingContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resultsLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: theme.textColor,
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
    backgroundColor: '#F7F7F7',
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
    paddingTop: 14,
    paddingBottom: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  input: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
    minHeight: 32,
    maxHeight: 70,
    marginBottom: 10,
  } as any,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  uploadButtonReasoning: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.primary,
    borderWidth: 1.5,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: theme.textColor,
  },
  uploadButtonTextReasoning: {
    color: theme.primary,
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
    borderColor: "rgba(100, 100, 100, 0.3)",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: 'rgba(250, 250, 250, 0.5)',
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(100, 100, 100, 0.2)",
  },
  tableCell: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: "rgba(100, 100, 100, 0.2)",
    justifyContent: "center",
    width: 100,
  },
  tableHeaderCell: {
    backgroundColor: "rgba(200, 200, 200, 0.3)",
    paddingVertical: 10,
  },
  tableFirstColumn: {
    backgroundColor: "rgba(200, 200, 200, 0.15)",
    width: 80,
  },
  tableCellText: {
    fontSize: 11,
    fontFamily: theme.regular,
    color: theme.textColor,
    lineHeight: 14,
  },
  tableHeaderText: {
    fontFamily: theme.bold,
    fontSize: 12,
    color: theme.textColor,
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
