import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import ConditionalBlurView from './ConditionalBlurView';

interface GlassEffectProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle | ViewStyle[];
  variant?: 'button' | 'pill' | 'card' | 'custom';
}

export default function GlassEffect({ 
  children, 
  intensity = 40, 
  tint = 'dark', 
  style, 
  variant = 'custom' 
}: GlassEffectProps) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'button':
        return styles.glassButton;
      case 'pill':
        return styles.glassPill;
      case 'card':
        return styles.glassCard;
      default:
        return {};
    }
  };

  const combinedStyle = [
    styles.glassBase,
    getVariantStyle(),
    style
  ];

  return (
    <ConditionalBlurView intensity={intensity} tint={tint} style={combinedStyle}>
      {children}
    </ConditionalBlurView>
  );
}

const styles = StyleSheet.create({
  glassBase: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)", 
    overflow: "hidden",
  },
  glassButton: {
    borderRadius: 25,
    marginHorizontal: 2,
  },
  glassPill: {
    flexDirection: "row",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
  },
  glassCard: {
    borderRadius: 16,
    padding: 16,
  },
});