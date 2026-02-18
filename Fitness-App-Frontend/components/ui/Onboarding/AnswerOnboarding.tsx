import { theme } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useOnboarding } from "../../../app/(auth)/Onboarding/NavigationService";

interface ButtonOnboardingProps {
  height?: number;
  imageSrc?: any;
  rightImage?: any;
  text: string;
  undertext?: string;
  BodyImage?: any;
  emoji?: string;
  onClick?: () => void;
  onClickContinue?: boolean;
  forQuestion?: string;
  style?: ViewStyle;
  animated?: boolean;
  order?: number;
  badgeText?: string;
  isMultipleAnswers?: boolean;
  textSize?: number;
}

const ButtonOnboarding: React.FC<ButtonOnboardingProps> = ({
  height = 63,
  imageSrc,
  rightImage,
  text,
  undertext,
  BodyImage,
  emoji,
  onClick,
  onClickContinue = true,
  forQuestion = "",
  style = {},
  animated = true,
  order = 0,
  badgeText,
  isMultipleAnswers = false,
  textSize = 18,
}) => {
  const [selected, setSelected] = useState(false);
  const { goForward, goBack, saveSelection } = useOnboarding();

  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 20 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          delay: order * 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          delay: order * 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, order]);

  const handleClick = () => {
    setSelected(!selected);
    
    // Rotate plus icon if multiple answers
    if (isMultipleAnswers) {
      Animated.timing(rotateAnim, {
        toValue: selected ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    if (onClick) onClick();

    if (onClickContinue && !isMultipleAnswers) {
      setTimeout(() => {
        saveSelection(forQuestion, text);
        goForward();
      }, 150);
    } else if (onClickContinue && isMultipleAnswers && selected) {
      // For multiple answers, continue only after selecting
      setTimeout(() => {
        saveSelection(forQuestion, text);
        goForward();
      }, 150);
    }
  };

  // Check if there are any icons/images on the sides
  const hasLeftIcon = isMultipleAnswers; // Plus icon on left
  const hasRightIcon = emoji || BodyImage || badgeText || rightImage || (imageSrc && !BodyImage);
  
  // Rotate animation interpolation
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            height: height,
            borderColor: "transparent",
            backgroundColor: selected ? theme.answerBackgroundSelected : theme.answerBackground,
          },
          style,
        ]}
        onPress={handleClick}
      >
        {isMultipleAnswers && (
          <Animated.View style={[styles.plusIcon, { transform: [{ rotate: rotateInterpolate }] }]}>
            <MaterialCommunityIcons 
              name="plus" 
              size={24} 
              color="#FFFFFF"
            />
          </Animated.View>
        )}

        <View style={styles.textContainer}>
          <Text style={[selected ? styles.selectedtext : styles.text, { fontSize: textSize }]}>{text}</Text>
          {undertext && <Text style={selected ? styles.selectedUndertext : styles.undertext}>{undertext}</Text>}
        </View>

        {emoji && !BodyImage && <Text style={styles.emoji}>{emoji}</Text>}
        {badgeText && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        )}
        {rightImage && (
          <Image 
            source={rightImage} 
            style={styles.rightImage}
            resizeMode="contain"
          />
        )}
        {imageSrc && !rightImage && (
          <Image source={imageSrc} style={styles.icon} resizeMode="contain" />
        )}
        {BodyImage && (
          <Image
            source={BodyImage}
            style={styles.bodyIcon}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 0,
    borderRadius: 30,
    backgroundColor: theme.answerBackground,
    gap: 14,
    width: 330,
    alignSelf: "center",
  },
  badge: {
    backgroundColor: "#579d28ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "center",
    marginLeft: 10,
  },
  badgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: theme.semibold,
  },

  icon: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  rightImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  plusIcon: {
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
    alignItems: "flex-start",
  },
  textContainerCentered: {
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: theme.medium,
    textAlign: "left",
  },
  textCentered: {
    textAlign: "center",
  },
  selectedtext: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: theme.medium,
    textAlign: "left",
  },
  undertext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
    textAlign: "left",
  },
  selectedUndertext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
    textAlign: "left",
  },
  undertextCentered: {
    textAlign: "center",
  },
  bodyIcon: {
    width: "50%",
    height: "100%",
  },
  emoji: {
    fontSize: 30,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default ButtonOnboarding;
