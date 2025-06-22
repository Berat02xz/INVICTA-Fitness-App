import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '@/constants/theme';
import ButtonFit from '@/components/ui/ButtonFit';
import GradientBackground from '@/components/ui/GradientBackground';
import { router } from 'expo-router';
import { use, useEffect, useState } from 'react';
import {useOnboarding} from '@/app/(auth)/Onboarding/NavigationService';


export default function DietResults() {
const animatedValue = new Animated.Value(0);
const [percentage, setPercentage] = useState(0);
const { goForward } = useOnboarding();
useEffect(() => {
    Animated.timing(animatedValue, {
        toValue: 79,
        duration: 1300,
        useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value }) => {
        setPercentage(Math.floor(value));
    });

    return () => {
        animatedValue.removeListener(listener);
    };

}, []);

return (
    <View style={styles.container}>
    <GradientBackground position="bottom" />

    <View style={styles.main}>

    <View style={styles.middle}>
        <Text style={styles.sloganBold}>{percentage}% of your results are about nutrition</Text>
        <Text style={styles.sloganRegular}>Eat smart, move more, build strength — not starve.</Text>
    </View>

    <View style={styles.bottom}>
        <ButtonFit title="Continue" backgroundColor={theme.primary} onPress={() => { goForward() }} />
    </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  main: {
    flex: 1,
    paddingTop: 300,
    paddingBottom: 80,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
  },
  middle: {
    alignItems: 'center',
  },
  bottom: {
    alignItems: 'center',
    gap: 10,
  },
  Logo: {
    fontSize: 48,
    fontFamily: theme.black,
    color: theme.textColor,
    marginBottom: 20,
  },
  sloganBold: {
    fontSize: 21,
    fontFamily: theme.bold,
    color: theme.primary,
    textAlign: 'center',
  },
  sloganRegular: {
    fontSize: 16,
    fontFamily: theme.light,
    color: '#D9D9D9',
    textAlign: 'center',
    marginTop: 10,
    width: '65%',
  },
  infoText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
});
