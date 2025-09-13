import React from 'react';
import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface ConditionalBlurViewProps {
  children: React.ReactNode;
  style?: any;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

const ConditionalBlurView: React.FC<ConditionalBlurViewProps> = ({ 
  children, 
  style, 
  intensity = 80, 
  tint = "dark" 
}) => {
  if (Platform.OS === 'android') {
    // Calculate opacity based on intensity (lower intensity = more transparent)
    const opacity = 0.85; // Range from 0.4 to 0.9
    
    const getBackgroundColor = () => {
      switch (tint) {
        case 'light':
          return `rgba(255, 255, 255, ${opacity})`;
        case 'dark':
          return `rgba(0, 0, 0, ${opacity})`;
        default:
          return `rgba(40, 40, 40, ${opacity})`;
      }
    };

    return (
      <View style={[style, { backgroundColor: getBackgroundColor() }]}>
        {children}
      </View>
    );
  }
  
  // iOS/Web: Use expo BlurView for true backdrop blur
  return (
    <BlurView intensity={intensity} tint={tint} style={style}>
      {children}
    </BlurView>
  );
};

export default ConditionalBlurView;