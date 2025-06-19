import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter-Light': require('../assets/fonts/Inter_18pt-Light.ttf'),
    'Inter-Black': require('../assets/fonts/Inter_18pt-Black.ttf'),
  });

  if (!fontsLoaded) {
    return <View><Text>Loading...</Text></View>;
  }

  return <Slot />;
}
