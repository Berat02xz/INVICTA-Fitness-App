import { theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface UndertextCardProps {
  emoji: string;
  title?: string;
  titleColor?: string;
  text: string;
}

const UndertextCard: React.FC<UndertextCardProps> = ({
  emoji,
  title,
  titleColor,
  text,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        {title && (
          <Text
            style={[
              styles.title,
              titleColor ? { color: titleColor } : undefined,
            ]}
          >
            {title}
          </Text>
        )}
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.buttonsolid,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    alignSelf: "center", // center horizontally
    width: 335, // take full width
  },
  emoji: {
    fontSize: 25,
  },
  title: {
    fontSize: 16,
    fontFamily: theme.semibold,
    marginBottom: 4,
    
  },
  text: {
    fontSize: 15,
    color: theme.textColor,
    fontFamily: theme.regular,
    textAlign: "left",
    lineHeight: 20,
  },
});


export default UndertextCard;
