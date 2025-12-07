import { theme } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface UndertextCardProps {
  emoji: string;
  title?: string;
  titleColor?: string;
  text: string;
  backgroundColor?: string;
}

const UndertextCard: React.FC<UndertextCardProps> = ({
  emoji,
  title,
  titleColor = "#000000",
  text,
  backgroundColor = "#ACFFB8",
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
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
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
    alignSelf: "center",
    width: 335,
  },
  emoji: {
    fontSize: 30,
    fontFamily: theme.medium,
    marginTop: 2,
  },
  title: {
    fontSize: 13,
    fontFamily: theme.medium,
    marginBottom: 4,
    color: theme.textColor,
  },
  text: {
    fontFamily: theme.light,
    textAlign: "left",
    color: theme.textColor,
    fontSize: 12,
    lineHeight: 18,
  },
});


export default UndertextCard;
