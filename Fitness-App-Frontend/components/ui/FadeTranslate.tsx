import React, { useEffect, useRef } from "react";
import { Animated, View, StyleProp, ViewStyle } from "react-native";

interface FadeTranslateProps {
  children: React.ReactNode;
  order?: number; // controls delay multiplier, default 0
  animated?: boolean; // control if animation runs, default true
  style?: StyleProp<ViewStyle>;
  translateYFrom?: number; // start offset Y, default 20
  duration?: number; // animation duration, default 350ms
}

const FadeTranslate: React.FC<FadeTranslateProps> = ({
  children,
  order = 0,
  animated = true,
  style,
  translateYFrom = 20,
  duration = 350,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYFrom)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          delay: order * 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay: order * 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, order, duration, fadeAnim, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeTranslate;
