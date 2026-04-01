import React, { useEffect, useRef } from "react";
import { Animated, View, StyleProp, ViewStyle } from "react-native";

interface FadeTranslateProps {
  children: React.ReactNode;
  order?: number; // controls delay multiplier, default 0
  delay?: number; // explicit base delay in ms, default 0
  animated?: boolean; // control if animation runs, default true
  style?: StyleProp<ViewStyle>;
  translateYFrom?: number; // start offset Y, default 20
  translateXFrom?: number; // start offset X, default 20
  duration?: number; // animation duration, default 350ms
  direction?: 'y' | 'x'; // translate direction
}

const FadeTranslate: React.FC<FadeTranslateProps> = ({
  children,
  order = 0,
  delay = 0,
  animated = true,
  style,
  translateYFrom = 20,
  translateXFrom = 20,
  duration = 450,
  direction = 'y',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(direction === 'y' ? translateYFrom : translateXFrom)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          delay: delay + (order * 200),
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration,
          delay: delay + (order * 200),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, order, delay, duration, fadeAnim, translateAnim]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [direction === 'y' ? { translateY: translateAnim } : { translateX: translateAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeTranslate;
