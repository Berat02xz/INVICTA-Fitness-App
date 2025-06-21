import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from './NavigationService';


const TopBar = () => {
      const { goBack, goForward, progressNow } = useOnboarding();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={goBack} style={styles.iconButton}>
        <Ionicons name="chevron-back" size={26} color="#333" />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${progressNow() * 100}%` }]} />
      </View>

      <TouchableOpacity onPress={goForward} style={styles.skipButton}>
        <Text style={styles.skip}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, 
  },
  iconButton: {
    padding: 4,
  },
  skipButton: {
    padding: 4,
  },
  skip: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#4CAF50',
  },
});

export default TopBar;