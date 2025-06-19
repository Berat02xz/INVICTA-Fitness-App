import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

interface ButtonFitProps {
    title: string;
    backgroundColor: string;
    hasBorder?: boolean;
    onPress: () => void;
}

const ButtonFit: React.FC<ButtonFitProps> = ({ title, backgroundColor, hasBorder = false, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: backgroundColor}, hasBorder ? { borderWidth: 1, borderColor: theme.buttonBorder } : {}]}
            onPress={onPress}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 337,
        height: 50,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
});


export default ButtonFit;