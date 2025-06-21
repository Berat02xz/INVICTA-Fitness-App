import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import ButtonFit from '@/components/ui/ButtonFit';
import GradientBackground from '@/components/ui/GradientBackground';
import { router } from 'expo-router';

export default function HomeScreen() {

  return (
    <View style={styles.container}>
    <GradientBackground position="top" />

    <View style={styles.main}>
    <View style={styles.top}>
        <Text style={styles.Logo}>INFIT</Text>
    </View>

    <View style={styles.middle}>
        <Text style={styles.sloganBold}>One decision</Text>
        <Text style={styles.sloganRegular}>That's all it takes.</Text>
    </View>

    <View style={styles.bottom}>
        <Text style={styles.infoText}>You already made yours.</Text>
        <ButtonFit title="Sign Up: Start The Quiz" backgroundColor={theme.primary} onPress={() => { router.push('/(auth)/Onboarding/FitnessGoal') }} />
        <ButtonFit title="Log In: I’ve done the quiz" backgroundColor={theme.buttonsolid} hasBorder onPress={() => { router.push('/login') }} />
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
    paddingTop: 120,
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
    fontSize: 25,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  sloganRegular: {
    fontSize: 25,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
  infoText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
});

