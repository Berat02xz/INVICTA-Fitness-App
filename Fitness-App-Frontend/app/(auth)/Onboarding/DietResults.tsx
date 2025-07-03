import { useOnboarding } from '@/app/(auth)/Onboarding/NavigationService';
import ButtonFit from '@/components/ui/ButtonFit';
import SolidBackground from '@/components/ui/SolidBackground';
import { theme } from '@/constants/theme';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function DietResults() {
  const animatedValue = useRef(new Animated.Value(0)).current;
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
  }, [animatedValue]);

  return (
    <View style={styles.outerContainer}>
      <SolidBackground />

      <View style={styles.container}>
        <View style={styles.middle}>
          <Text style={styles.sloganBold}>{percentage}% of your results are about nutrition</Text>
          <Text style={styles.sloganRegular}>
            Eat smart, move more, build strength — not starve.
          </Text>
        </View>

        
      </View>
        <View style={styles.bottom}>
          <ButtonFit title="Continue" backgroundColor={theme.primary} onPress={() => goForward()} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flex: 1,
    paddingTop: 250,
    paddingBottom: 80,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  middle: {
    alignItems: 'center',
  },
  bottom: {
    alignItems: 'center',
    marginBottom: 50,
    flex: 1,
    justifyContent: 'flex-end',
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
