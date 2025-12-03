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
    backgroundColor: theme.backgroundSecondary,
    padding: 15,
    borderRadius: theme.borderRadius.md,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    alignSelf: "center",
    width: 335,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emoji: {
    fontSize: 25,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontFamily: theme.semibold,
    marginBottom: 4,
    color: theme.textColor,
  },
  text: {
    fontFamily: theme.regular,
    textAlign: "left",
    color: theme.textColorSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 18,
  },
});


export default UndertextCard;
