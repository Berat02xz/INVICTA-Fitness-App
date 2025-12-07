import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/constants/theme";

interface ReviewCardProps {
  name: string;
  username: string;
  avatar: any; 
  rating: number;
  comment: string;
}

export default function ReviewCard({
  name,
  username,
  avatar,
  rating,
  comment,
}: ReviewCardProps) {
  return (
    <View style={styles.card}>
      <Image source={avatar} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>@{username}</Text>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name={i < rating ? "star" : "star-outline"}
                size={16}
                color={theme.primary}
              />
            ))}
          </View>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.comment} numberOfLines={4}>{comment}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: theme.backgroundColor,
    borderRadius: 16,
    marginTop: 20,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: 336,
    height: 160,
    padding: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  content: {
    paddingRight: 15,
    flex: 1,
    left: 10,
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    color: theme.textColorSecondary,
    fontSize: 11,
    fontFamily: theme.regular,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  name: {
    color: theme.textColor,
    fontFamily: theme.semibold,
    fontSize: 13,
    marginBottom: 3,
  },
  comment: {
    color: theme.textColor,
    fontFamily: theme.regular,
    fontSize: 13,
    lineHeight: 17,
    width: 230,
  },
});
