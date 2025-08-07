import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabs}>
          {state.routes.map((route, index) => {
            if (route.name === "nutrition/screens/scan") return null; // hidden route

            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const icon = options.tabBarIcon?.({ focused: isFocused, color: '', size: 24 });

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
              >
                {icon}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 100,
    height: 70,
    borderRadius: 18,
    overflow: 'hidden',
    zIndex: 10,
    backgroundColor: '#1C1C1C',
  },
  blurContainer: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
});

export default CustomTabBar;
