import { theme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonFitProps {
    title: string;
    backgroundColor: string;
    hasBorder?: boolean;
    onPress: () => void;
    style?: object;
}

const ButtonFit: React.FC<ButtonFitProps> = ({ title, backgroundColor, onPress, style }) => {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: backgroundColor }, style]}
            onPress={onPress}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 337,
        height: 62,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: theme.textColor,
        fontSize: 16,
        fontFamily: theme.semibold,
    },
});


export default ButtonFit;