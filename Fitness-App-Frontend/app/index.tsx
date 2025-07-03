import ButtonFit from '@/components/ui/ButtonFit';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {

  return (
    <View style={styles.container}>

    <View style={styles.main}>
    <View style={styles.top}>
      <Image
        source={require('@/assets/icons/branding/Invictus_Logo.png')}
        style={styles.Logo}
        resizeMode="contain"
      />

        <Text style={[styles.sloganBold, {marginTop:10}]}>One decision</Text>
        <Text style={styles.sloganRegular}>That's all it takes.</Text>
    </View>


    
    </View>
    <View style={styles.bottom}>
        <ButtonFit title="Sign Up: Start The Quiz" backgroundColor={theme.primary} onPress={() => { router.push('/(auth)/Onboarding/FitnessGoal') }} />
        <ButtonFit title="Log In: I’ve done the quiz" backgroundColor={theme.buttonsolid} hasBorder onPress={() => { router.push('/login') }} />
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
    marginBottom: 70,
    flex: 1,
    justifyContent: 'flex-end',
  },
  Logo: {
    fontSize: 48,
    fontFamily: theme.black,
    color: theme.textColor,
    marginBottom: 20,
  },
  sloganBold: {
    fontSize: 30,
    fontFamily: theme.bold,
    color: theme.textColor,
  },
  sloganRegular: {
    fontSize: 30,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
  infoText: {
    fontSize: 15,
    fontFamily: theme.regular,
    color: theme.textColor,
  },
});

