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
        <Text style={styles.comment}>{comment}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    color: "#aaa",
    fontSize: 12,
  },
  stars: {
    flexDirection: "row",
  },
  name: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  comment: {
    color: "#ddd",
    fontSize: 13,
    lineHeight: 18,
  },
});
