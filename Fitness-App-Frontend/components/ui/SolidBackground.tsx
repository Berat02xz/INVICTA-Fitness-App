import { theme } from '@/constants/theme';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default function SolidBackground({ style }: Props) {
  return (
    <View style={[styles.background, style]} />
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.backgroundColor,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
});
