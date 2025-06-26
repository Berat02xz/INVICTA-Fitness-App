import React, { useState } from "react";
import { TouchableOpacity, View, Text, Image, StyleSheet } from "react-native";
import { theme } from "@/constants/theme";
import { useOnboarding } from '../../app/(auth)/Onboarding/NavigationService';
import { ViewStyle } from "react-native";

interface ButtonOnboardingProps {
  height?: number;
  imageSrc?: any;
  
  text: string;

  undertext?: string;
  BodyImage?: any;
  onClick?: () => void;
  oneAnswer?: boolean;
  forQuestion?: string;
  style?: ViewStyle; 

}

const ButtonOnboarding: React.FC<ButtonOnboardingProps> = ({
  height = 57,
  imageSrc,
  text,
  undertext,
  BodyImage,
  onClick,
  oneAnswer = false,
  forQuestion = "",
  style = {}, 
}) => {
  
  const [selected, setSelected] = useState(false);
    const { goForward, goBack, saveSelection } = useOnboarding();

  const handleClick = () => {
    setSelected(!selected);
    if (onClick) onClick();


    if (oneAnswer) {
      setTimeout(() => {
        saveSelection(forQuestion, text);
        goForward();
      }, 150);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { height, borderColor: selected ? theme.primary : "#5B5B5B" },
        style,
      ]}
      onPress={handleClick}
    >
      {imageSrc && (
        <Image source={imageSrc} style={styles.icon} resizeMode="contain" />
      )}

      <View style={styles.textContainer}>
        <Text style={styles.text}>{text}</Text>
        {undertext && <Text style={styles.undertext}>{undertext}</Text>}
      </View>

      {BodyImage && (
        <Image
          source={BodyImage}
          style={styles.bodyIcon}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: theme.buttonsolid,
  },
  icon: {
    width: 30,
    height: 31,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontFamily: theme.regular,
  },
  undertext: {
    fontSize: 12,
    color: "#e0e0e0",
    marginTop: 4,
  },
  bodyIcon: {
    width: "50%",
    height: "100%",
  },
});

export default ButtonOnboarding;
