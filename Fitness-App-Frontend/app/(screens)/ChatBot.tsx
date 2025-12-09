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
  Alert,
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

const GREETING_SUGGESTIONS = [
  { icon: "clock-fast", text: "15 min meals", color: "#4CAF50" },
  { icon: "dumbbell", text: "Workout plan", color: "#FF6B35" },
  { icon: "chef-hat", text: "Quick breakfast", color: "#2196F3" },
  { icon: "fire", text: "Burn calories", color: "#FFC107" },
];

const GREETING_VARIANTS = [
  () => `What can I help with?`,
  () => `How can I assist you?`,
  () => `What can I do for you?`,
];

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
  const [userPlan, setUserPlan] = useState("Free");
  const [subscriptionPlan, setSubscriptionPlan] = useState("Free");
  const [isReasoning, setIsReasoning] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState("What can I help with?");
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const emojiAnimX = useRef(new Animated.Value(0)).current;
  const emojiAnimY = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const thinkingOpacity = useRef(new Animated.Value(0.4)).current;

  // Load user name and handle back button/gesture
  useFocusEffect(
    React.useCallback(() => {
      const loadUserName = async () => {
        try {
          const user = await GetUserDetails();
          if (user?.name) {
            const firstName = user.name.split(' ')[0];
            setUserName(firstName);
            // Set random greeting
            const randomGreeting = GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
            setGreetingMessage(randomGreeting());
          }
          if (user?.role) {
            setSubscriptionPlan(user.role);
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
      thinkingOpacity.setValue(0.4);
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

    // Start the thinking text opacity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(thinkingOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(thinkingOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
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
      thinkingOpacity.setValue(0.4);
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
                style={styles.messageActionIcon}
                onPress={async () => {
                  try {
                    await Share.share({ message: item.text });
                  } catch (error) {
                    console.error('Copy failed:', error);
                  }
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="content-copy" 
                  size={18} 
                  color="#9CA3AF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageActionIcon}
                onPress={() => handleShareMessage(item)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="share-variant-outline" 
                  size={18} 
                  color="#9CA3AF"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageActionIcon}
                onPress={() => saveMessage(item)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name={savedMessageIds.has(item.id) ? "bookmark" : "bookmark-outline"} 
                  size={18} 
                  color={savedMessageIds.has(item.id) ? "#6366F1" : "#9CA3AF"}
                />
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
              style={styles.headerButton}
              onPress={() => router.replace("/(tabs)/workout")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#6B7280" />
            </TouchableOpacity>
            
            {subscriptionPlan && (
              <View style={styles.planPill}>
                <MaterialCommunityIcons name="star-four-points" size={14} color="#e37d4eff" />
                <Text style={styles.planText}>{subscriptionPlan === "Free" ? "Get Plus" : "Plus"}</Text>
              </View>
            )}
            
            <View style={styles.headerRightIcons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={toggleSavedMessages}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="message-outline" 
                  size={24} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.greetingText}>{greetingMessage}</Text>
                <View style={styles.greetingSuggestionsGrid}>
                  {GREETING_SUGGESTIONS.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.greetingSuggestionPill}
                      onPress={() => sendMessage(suggestion.text)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name={suggestion.icon as any} size={18} color={suggestion.color} />
                      <Text style={styles.greetingSuggestionText}>{suggestion.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
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
                    <Animated.Text style={[styles.resultsText, { opacity: thinkingOpacity }]}>Thinking</Animated.Text>
                  </View>
                </View>
              ) : null
            }
          />

          {/* Input */}
          <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboardOpen]}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => router.push("/(screens)/ScanMeal")}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="camera-outline" 
                size={22} 
                color="#6B7280"
              />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Ask me anything..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline={false}
                maxLength={500}
              />

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
        </KeyboardAvoidingView>

        {/* Saved Messages Modal */}
        <Modal
          visible={showSavedMessages}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSavedMessages(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              activeOpacity={1} 
              onPress={() => setShowSavedMessages(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalDragIndicator} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Saved Messages</Text>
                <TouchableOpacity
                  onPress={() => setShowSavedMessages(false)}
                  style={styles.modalCloseButton}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={savedMessages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.savedMessageCard}>
                    <View style={styles.savedMessageContent}>
                      <Text style={styles.savedMessageText}>{item.messageText}</Text>
                      <View style={styles.savedMessageActions}>
                        <Text style={styles.savedMessageDate}>
                          {new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        <View style={styles.savedMessageIcons}>
                          <TouchableOpacity
                            style={styles.savedActionIcon}
                            onPress={async () => {
                              try {
                                await Share.share({ message: item.messageText });
                              } catch (error) {
                                console.error('Copy failed:', error);
                              }
                            }}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="content-copy" size={16} color="#9CA3AF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.savedActionIcon}
                            onPress={async () => {
                              try {
                                await Share.share({ message: item.messageText, title: "Share Message" });
                              } catch (error) {
                                console.error('Share failed:', error);
                              }
                            }}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="share-variant-outline" size={16} color="#9CA3AF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.savedActionIcon}
                            onPress={() => deleteSavedMessage(item.id)}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons name="bookmark" size={16} color="#000000" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                contentContainerStyle={styles.savedMessagesList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyModalContainer}>
                    <MaterialCommunityIcons name="bookmark-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No saved messages yet</Text>
                    <Text style={styles.emptySubtext}>Save messages to access them later</Text>
                  </View>
                }
              />
            </View>
          </View>
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
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 8,
  },
  planPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff4f0ff",
    borderWidth: 1,
    borderColor: '#ffe0e0ff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: '#d2571eff',
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
    paddingHorizontal: 20,
  },
  greetingEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 24,
    fontFamily: theme.semibold,
    color: '#111827',
    textAlign: "center",
    marginBottom: 30,
  },
  greetingSuggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    rowGap: 10,
  },
  greetingSuggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  greetingSuggestionText: {
    fontSize: 14,
    fontFamily: theme.medium,
    textAlign: 'center',
    color: '#374151',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 120,
    paddingBottom: 100,
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
    shadowRadius: 50,
    elevation: 3,
  },
  messageBubbleWide: {
    width: "100%",
  },
  userBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
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
    gap: 16,
    marginTop: 8,
    alignItems: 'center',
    paddingLeft: 4,
  },
  messageActionIcon: {
    padding: 4,
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
    paddingBottom: 20,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainerKeyboardOpen: {
    paddingBottom: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
    paddingVertical: 0,
  } as any,
  cameraButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 8,
  },
  uploadButton: {
    width: 36,
    height: 36,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    gap: 4,
  },
  uploadButtonReasoning: {
    backgroundColor: '#FFF3E0',
  },
  uploadButtonText: {
    fontSize: 0,
    fontFamily: theme.medium,
    color: theme.textColor,
  },
  uploadButtonTextReasoning: {
    color: theme.primary,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    height: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: theme.semibold,
    color: '#111827',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedMessagesList: {
    padding: 20,
    paddingTop: 8,
  },
  savedMessageCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  savedMessageContent: {
    padding: 16,
  },
  savedMessageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  savedMessageIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  savedActionIcon: {
    padding: 4,
  },
  savedMessageDate: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: '#9CA3AF',
  },
  savedMessageText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: '#374151',
    lineHeight: 22,
  },
  emptyModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 17,
    fontFamily: theme.semibold,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: theme.regular,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});
