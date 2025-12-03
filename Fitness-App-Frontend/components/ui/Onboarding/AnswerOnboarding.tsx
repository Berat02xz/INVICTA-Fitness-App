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
  iconName?: string;
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
}

const ButtonOnboarding: React.FC<ButtonOnboardingProps> = ({
  height = 80,
  imageSrc,
  iconName,
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
}) => {
  const [selected, setSelected] = useState(false);
  const { goForward, goBack, saveSelection } = useOnboarding();

  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 20 : 0)).current;

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
    if (onClick) onClick();

    if (onClickContinue) {
      setTimeout(() => {
        saveSelection(forQuestion, text);
        goForward();
      }, 150);
    }
  };

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
            height,
            borderColor: selected ? theme.primary : "transparent",
            backgroundColor: selected ? theme.primary : theme.buttonsolid,
          },
          style,
        ]}
        onPress={handleClick}
      >
        {iconName && (
          <MaterialCommunityIcons 
            name={iconName as any} 
            size={32} 
            color={theme.primary} 
            style={styles.iconStyle}
          />
        )}
        {imageSrc && !iconName && (
          <Image source={imageSrc} style={styles.icon} resizeMode="contain" />
        )}

        <View style={styles.textContainer}>
          <Text style={styles.text}>{text}</Text>
          {undertext && <Text style={styles.undertext}>{undertext}</Text>}
        </View>

        {emoji && !BodyImage && <Text style={styles.emoji}>{emoji}</Text>}
        {badgeText && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
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
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: theme.buttonsolid,
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
    color: theme.textColor,
    fontFamily: theme.semibold,
  },

  icon: {
    width: 30,
    height: 31,
    marginLeft: 10,
  },
  iconStyle: {
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  text: {
    color: theme.textColor,
    fontSize: 16,
    fontFamily: theme.semibold,
  },
  undertext: {
    fontSize: 12,
    color: theme.textColorSecondary,
    marginTop: 3,
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
