import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonFitProps {
    title: string;
    backgroundColor: string;
    hasBorder?: boolean;
    onPress: () => void;
}

const ButtonFit: React.FC<ButtonFitProps> = ({ title, backgroundColor, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: backgroundColor }]}
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
        borderRadius: 10,
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