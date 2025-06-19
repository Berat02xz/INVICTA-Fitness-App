import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  position: 'top' | 'bottom';
}

export default function GradientBackground({ position }: Props) {
  const colors: [string, string] = position === 'top'
    ? ['#36120D', '#030303']
    : ['#030303', '#2D110D'];

  const locations: [number, number] = position === 'top' ? [0, 0.3] : [0.8, 1];

  return (
    <LinearGradient
      colors={colors}
      locations={locations}
      style={StyleSheet.absoluteFillObject}
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
});
