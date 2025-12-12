import FadeTranslate from "@/components/ui/FadeTranslate";
import * as Clipboard from 'expo-clipboard';
import { useVideoPlayer, VideoView } from 'expo-video';
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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const NUTRITION_KEYWORDS = ["meal", "nutrition", "food", "recipes", "eat", "diet", "calorie", "protein", "carbs", "fat", "hungry", "breakfast", "lunch", "dinner"];
const FITNESS_KEYWORDS = ["fitness", "workout", "gym", "exercise", "training", "muscle", "cardio", "strength", "run", "lift", "weight"];

const GREETING_SUGGESTIONS = [
  { icon: "clock-fast", text: "15 min meals table", color: "#22C55E" },
  { icon: "dumbbell", text: "Workout plan table", color: "#EF4444" },
  { icon: "chef-hat", text: "Quick breakfast", color: "#F97316" },
  { icon: "fire", text: "How to burn calories fast", color: "#EF4444" },
  { icon: "food-apple", text: "Healthy snacks for me", color: "#22C55E" },
  { icon: "weight-lifter", text: "How to Build muscle", color: "#3B82F6" },
  { icon: "run-fast", text: "Cardio tips for me", color: "#F97316" },
  { icon: "food-drumstick", text: "High protein food table", color: "#A855F7" },
  { icon: "scale-bathroom", text: "Lose weight plan for me", color: "#EC4899" },
  { icon: "yoga", text: "Stretching properly", color: "#14B8A6" },
  { icon: "food-variant", text: "Meal prep for me", color: "#22C55E" },
  { icon: "lightning-bolt", text: "Pre-workout tips list", color: "#FBBF24" },
  { icon: "sleep", text: "Recovery tips", color: "#6366F1" },
  { icon: "water", text: "Hydration importance", color: "#0EA5E9" },
  { icon: "arm-flex", text: "Arm workout table", color: "#EF4444" },
];

const GREETING_VARIANTS = [
  () => `What can I help with?`,
  () => `How can I assist you?`,
  () => `What can I do for you?`,
  () => `How may I help you today?`,
  () => `What would you like to know?`,
];

const AI_VIDEOS = [
  require('@/assets/videos/blue.mp4'),
  require('@/assets/videos/brand_ai.mp4'),
  require('@/assets/videos/violet.mp4'),
  require('@/assets/videos/green.mp4'),
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
  const [showSavedMessages, setShowSavedMessages] = useState(false);
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const [subscriptionPlan, setSubscriptionPlan] = useState("Free");
  const [greetingMessage, setGreetingMessage] = useState("What can I help with?");
  const [randomSuggestions, setRandomSuggestions] = useState<typeof GREETING_SUGGESTIONS>([]);
  // Pick one random video on mount and keep it for the session
  const selectedVideo = useRef(AI_VIDEOS[Math.floor(Math.random() * AI_VIDEOS.length)]).current;
  const videoPlayer = useVideoPlayer(selectedVideo, (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });
  // Separate video player for loading indicator
  const loadingVideoPlayer = useVideoPlayer(selectedVideo, (player) => {
    player.loop = true;
    player.muted = true;
    player.staysActiveInBackground = true;
  });
  const flatListRef = useRef<FlatList>(null);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const thinkingOpacity = useRef(new Animated.Value(0.4)).current;

  // Load user data and handle back button/gesture
  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      
      const loadUserData = async () => {
        try {
          const user = await GetUserDetails();
          if (user?.name) {
            // Set random greeting
            const randomGreeting = GREETING_VARIANTS[Math.floor(Math.random() * GREETING_VARIANTS.length)];
            setGreetingMessage(randomGreeting());
          }
          if (user?.role) {
            setSubscriptionPlan(user.role);
          }
          // Pick 4 random suggestions
          const shuffled = [...GREETING_SUGGESTIONS].sort(() => Math.random() - 0.5);
          setRandomSuggestions(shuffled.slice(0, 4));
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      };

      // Always ensure video plays when screen comes into focus
      videoPlayer.loop = true;
      videoPlayer.muted = true;
      
      // Small delay to ensure video is ready on web
      setTimeout(() => {
        if (mounted) {
          videoPlayer.play();
        }
      }, 100);

      loadUserData();

      const onBackPress = () => {
        router.replace("/(tabs)/workout");
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        mounted = false;
        subscription.remove();
        // Pause when leaving screen to ensure clean state on return
        videoPlayer.pause();
      };
    }, [videoPlayer])
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

  // Animate loading state
  useEffect(() => {
    if (!isLoading) {
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

    return () => {
      spinAnim.setValue(0);
      thinkingOpacity.setValue(0.4);
    };
  }, [isLoading]);

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

  // Parse HTML response and render styled components
  type HtmlNode = { type: 'text'; value: string } | { type: 'element'; tag: string; children: HtmlNode[] };

  const parseHtmlToNodes = (html: string): HtmlNode[] => {
    const allowedTags = new Set(['food', 'exercise', 'b', 'i', 'p', 'ul', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'h1', 'span', 'br']);
    const root: { type: 'element'; tag: 'root'; children: HtmlNode[] } = { type: 'element', tag: 'root', children: [] };
    const stack: Array<{ type: 'element'; tag: string; children: HtmlNode[] }> = [root];

    const tagTokenRegex = /<\/?\s*([a-zA-Z0-9]+)(?:\s[^>]*?)?\s*\/?\s*>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const pushText = (text: string) => {
      if (!text) return;
      stack[stack.length - 1].children.push({ type: 'text', value: text });
    };

    while ((match = tagTokenRegex.exec(html)) !== null) {
      const token = match[0];
      const tag = (match[1] || '').toLowerCase();
      const index = match.index;

      pushText(html.slice(lastIndex, index));
      lastIndex = index + token.length;

      const isClosing = /^\//.test(token.slice(1));
      const isSelfClosing = /\/?>\s*$/.test(token) && (tag === 'br' || token.includes('/>'));

      if (!allowedTags.has(tag)) {
        // Treat unknown tags as text instead of skipping
        pushText(token);
        continue;
      }

      if (isSelfClosing) {
        if (tag === 'br') pushText('\n');
        continue;
      }

      if (!isClosing) {
        const node: HtmlNode = { type: 'element', tag, children: [] };
        stack[stack.length - 1].children.push(node);
        stack.push(node as any);
      } else {
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].tag === tag) {
            stack.splice(i);
            break;
          }
        }
      }
    }

    pushText(html.slice(lastIndex));
    return root.children;
  };

  const collectText = (nodes: HtmlNode[]): string => {
    return nodes.map(n => (n.type === 'text' ? n.value : collectText(n.children))).join('');
  };

  const renderHtmlNodes = (nodes: HtmlNode[], keyPrefix: string, isInTable: boolean = false): React.ReactNode[] => {
    let keyCounter = 0;
    const nextKey = () => `${keyPrefix}-${keyCounter++}`;

    const out: React.ReactNode[] = [];
    for (const node of nodes) {
      if (node.type === 'text') {
        if (!node.value) continue;
        const normalized = node.value.replace(/\s+/g, ' ');
        if (!normalized.trim()) continue;
        out.push(<Text key={nextKey()} style={isInTable ? styles.tableText : styles.messageText}>{normalized}</Text>);
        continue;
      }

      const tag = node.tag;
      const children = node.children;

      switch (tag) {
        case 'food':
          out.push(
            <TouchableOpacity key={nextKey()} style={styles.foodPill} activeOpacity={0.7} onPress={() => {}}>
              <MaterialCommunityIcons name="magnify" size={14} color="#15803D" />
              <Text style={styles.foodPillText}>{collectText(children).trim()}</Text>
            </TouchableOpacity>
          );
          break;
        case 'exercise':
          out.push(
            <TouchableOpacity key={nextKey()} style={styles.exercisePill} activeOpacity={0.7} onPress={() => {}}>
              <MaterialCommunityIcons name="magnify" size={14} color="#C2410C" />
              <Text style={styles.exercisePillText}>{collectText(children).trim()}</Text>
            </TouchableOpacity>
          );
          break;
        case 'h1':
          out.push(
            <View key={nextKey()} style={styles.h1Container}>
              <Text style={styles.h1Text}>{collectText(children).trim()}</Text>
            </View>
          );
          break;
        case 'p':
          out.push(
            <View key={nextKey()} style={styles.paragraph}>
              <View style={styles.inlineWrap}>{renderHtmlNodes(children, nextKey(), isInTable)}</View>
            </View>
          );
          break;
        case 'ul':
          out.push(<View key={nextKey()} style={styles.listContainer}>{renderHtmlNodes(children, nextKey(), isInTable)}</View>);
          break;
        case 'li':
          out.push(
            <View key={nextKey()} style={styles.listItem}>
              <Text style={isInTable ? styles.tableText : styles.messageText}>• </Text>
              <View style={styles.inlineWrap}>{renderHtmlNodes(children, nextKey(), isInTable)}</View>
            </View>
          );
          break;
        case 'table':
          out.push(
            <ScrollView key={nextKey()} horizontal showsHorizontalScrollIndicator={false} style={styles.tableScrollView}>
              <View style={styles.tableContainer}>{renderHtmlNodes(children, nextKey(), true)}</View>
            </ScrollView>
          );
          break;
        case 'thead':
        case 'tbody':
          out.push(...renderHtmlNodes(children, nextKey(), isInTable));
          break;
        case 'tr':
          out.push(<View key={nextKey()} style={styles.tableRow}>{renderHtmlNodes(children, nextKey(), isInTable)}</View>);
          break;
        case 'td':
        case 'th':
          out.push(
            <View key={nextKey()} style={[styles.tableCell, tag === 'th' ? styles.tableHeaderCell : null]}>
              <View style={styles.inlineWrap}>{renderHtmlNodes(children, nextKey(), isInTable)}</View>
            </View>
          );
          break;
        case 'b':
          out.push(<Text key={nextKey()} style={[isInTable ? styles.tableText : styles.messageText, { fontFamily: theme.bold }]}>{collectText(children)}</Text>);
          break;
        case 'i':
          out.push(<Text key={nextKey()} style={[isInTable ? styles.tableText : styles.messageText, { fontStyle: 'italic' }]}>{collectText(children)}</Text>);
          break;
        case 'span':
          out.push(<Text key={nextKey()} style={isInTable ? styles.tableText : styles.messageText}>{collectText(children)}</Text>);
          break;
        default:
          out.push(...renderHtmlNodes(children, nextKey(), isInTable));
      }
    }

    return out;
  };

  const parseHtmlResponse = (html: string) => {
    if (!html) return null;
    const nodes = parseHtmlToNodes(html);
    const rendered = renderHtmlNodes(nodes, 'html');
    // Wrap root-level content in inline container to allow mixed inline elements
    return rendered.length ? <View style={styles.inlineWrap}>{rendered}</View> : <Text style={styles.messageText}>{html}</Text>;
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

      // If already saved, delete it (toggle behavior)
      if (savedMessageIds.has(message.id)) {
        // Find the saved message with matching text
        const savedMessage = savedMessages.find(m => m.messageText === message.text);
        if (savedMessage) {
          await SavedMessage.deleteMessage(database, savedMessage.id);
          setSavedMessageIds(prev => {
            const newSet = new Set([...prev]);
            newSet.delete(message.id);
            return newSet;
          });
        }
      } else {
        // Save new message
        await SavedMessage.saveMessage(
          database,
          userId,
          message.text,
          message.isUser ? 'user' : 'ai'
        );
        
        // Add message ID to saved set
        setSavedMessageIds(prev => new Set([...prev, message.id]));
      }
      
      await loadSavedMessages();
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
      
      // Create AI message with streaming content
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        text: '',
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Use streaming API
      await AIEndpoint.askChatStream(questionWithContext, (chunk: string) => {
        console.log('ChatBot received chunk:', chunk);
        // Update the AI message with streamed content
        setMessages(prev => {
          const updated = prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: msg.text + chunk }
              : msg
          );
          const aiMsg = updated.find(m => m.id === aiMessageId);
          console.log('Updated AI message text:', aiMsg?.text);
          return updated;
        });
      });
      
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
    // Debug: log what we're rendering
    console.log('Rendering message:', item.id, 'isUser:', item.isUser, 'text length:', item.text?.length);
    
    return (
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <View style={item.isUser ? styles.userBubbleWrapper : styles.messageBubbleWrapper}>
          <View
            style={[
              styles.messageBubble,
              item.isUser 
                ? styles.userBubble
                : styles.aiBubble,
            ]}
          >
            {item.isUser ? (
              <Text style={styles.messageText}>
                {highlightKeywords(item.text)}
              </Text>
            ) : (
              <View style={styles.aiMessageContent}>
                {parseHtmlResponse(item.text || '')}
              </View>
            )}
          </View>
          {!item.isUser && item.text && item.text.trim() !== '' && (
            <View style={styles.messageActionsContainer}>
              <TouchableOpacity
                style={styles.messageActionIcon}
                onPress={async () => {
                  try {
                    await Clipboard.setStringAsync(item.text);
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
                <MaterialCommunityIcons name="star-four-points" size={14} color="#e65f20ff" />
                <Text style={styles.planText}>{subscriptionPlan === "FREE" ? "Get Premium" : "Unlimited Plan"}</Text>
              </View>
            )}
            
            <View style={styles.headerRightIcons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={toggleSavedMessages}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="bookmark-outline" 
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
                <FadeTranslate order={0}>
                  <VideoView
                    player={videoPlayer}
                    style={styles.greetingVideo}
                    nativeControls={false}
                    contentFit="contain"
                    playsInline
                  />
                </FadeTranslate>
                <FadeTranslate order={1}>
                  <Text style={styles.greetingText}>{greetingMessage}</Text>
                </FadeTranslate>
                <View style={styles.greetingSuggestionsGrid}>
                  {randomSuggestions.map((suggestion, index) => (
                    <FadeTranslate key={index} order={index + 2}>
                      <TouchableOpacity
                        style={styles.greetingSuggestionPill}
                        onPress={() => sendMessage(suggestion.text)}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons name={suggestion.icon as any} size={18} color={suggestion.color} />
                        <Text style={styles.greetingSuggestionText}>{suggestion.text}</Text>
                      </TouchableOpacity>
                    </FadeTranslate>
                  ))}
                </View>
              </View>
            }
            ListFooterComponent={
              isLoading ? (
                <View style={styles.loadingContainer}>
                  <View style={styles.resultsLabelContainer}>
                    <VideoView
                      player={loadingVideoPlayer}
                      style={styles.loadingVideo}
                      nativeControls={false}
                      contentFit="contain"
                      playsInline
                      onFirstFrameRender={() => {
                        loadingVideoPlayer.play();
                      }}
                    />
                    <Animated.Text style={[styles.resultsText, { opacity: thinkingOpacity }]}>Thinking</Animated.Text>
                  </View>
                </View>
              ) : null
            }
          />

          {/* Input */}
          <View style={styles.inputContainerWrapper}>
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
                <Text style={styles.modalTitle}>Saved</Text>
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
                      <View style={styles.aiMessageContent}>
                        {parseHtmlResponse(item.messageText)}
                      </View>
                      <View style={styles.savedMessageActions}>
                        <Text style={styles.savedMessageDate}>
                          {new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                        <View style={styles.savedMessageIcons}>
                          <TouchableOpacity
                            style={styles.savedActionIcon}
                            onPress={async () => {
                              try {
                                await Clipboard.setStringAsync(item.messageText);
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
                            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#9CA3AF" />
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FAFAFA',
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  planPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planText: {
    fontSize: 14,
    fontFamily: theme.medium,
    color: '#000000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  greetingVideo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 25,
    fontFamily: theme.medium,
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
    maxWidth: 768,
    width: '100%',
    marginHorizontal: 'auto',
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    maxWidth: '90%',
  },
  aiMessage: {
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  messageBubbleWrapper: {
    flex: 1,
  },
  userBubbleWrapper: {
    maxWidth: '100%',
    alignSelf: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 100,
    elevation: 3,
  },
  messageBubbleWide: {
    width: "100%",
  },
  userBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
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
  tableText: {
    fontSize: 13,
    fontFamily: theme.regular,
    color: theme.textColor,
    lineHeight: 16,
  },
  aiMessageContent: {
    flexDirection: 'column',
    gap: 6,
  },
  inlineWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  foodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginVertical: 2,
  },
  foodPillText: {
    fontSize: 13,
    fontFamily: theme.medium,
    color: '#15803D',
  },
  exercisePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginVertical: 2,
  },
  exercisePillText: {
    fontSize: 13,
    fontFamily: theme.medium,
    color: '#C2410C',
  },
  h1Container: {
    width: '100%',
    marginTop: 12,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  h1Text: {
    fontSize: 22,
    fontFamily: theme.bold,
    color: '#111827',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  paragraph: {
    width: '100%',
    marginVertical: 4,
  },
  listContainer: {
    marginVertical: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  tableScrollView: {
    marginVertical: 8,
  },
  tableContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableCell: {
    flex: 1,
    minWidth: 100,
    maxWidth: 200,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tableHeaderCell: {
    backgroundColor: '#F9FAFB',
  },
  tableHeaderText: {
    fontFamily: theme.bold,
    color: '#374151',
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
  boldKeyword: {
    fontSize: 14,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  loadingContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  loadingVideo: {
    width: 24,
    height: 24,
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
  inputContainerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 768,
    marginHorizontal: 'auto',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'transparent',
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
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 60,
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
    shadowOpacity: 0.10,
    shadowRadius: 60,
    elevation: 8,
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
    width: '100%',
    maxWidth: 768,
    paddingTop: 8,
    alignSelf: 'center',
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
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.5)',
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
