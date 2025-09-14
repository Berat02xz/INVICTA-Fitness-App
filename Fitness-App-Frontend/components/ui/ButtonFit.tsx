import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';

interface ButtonFitProps {
    title: string;
    backgroundColor: string;
    hasBorder?: boolean;
    onPress: () => void;
    style?: object;
    isLoading?: boolean;
    loadingText?: string;
}

const ButtonFit: React.FC<ButtonFitProps> = ({ 
    title, 
    backgroundColor, 
    onPress, 
    style, 
    isLoading = false,
    loadingText = "Loading..."
}) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Rotation animation
    useEffect(() => {
        if (isLoading) {
            const rotateAnimation = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            rotateAnimation.start();
            return () => rotateAnimation.stop();
        } else {
            rotateAnim.setValue(0);
        }
    }, [isLoading]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <TouchableOpacity
            style={[
                styles.button, 
                { backgroundColor: backgroundColor }, 
                isLoading && styles.buttonDisabled,
                style
            ]}
            onPress={onPress}
            disabled={isLoading}
        >
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Animated.View style={[
                        styles.loadingIcon,
                        { transform: [{ rotate: rotateInterpolate }] }
                    ]}>
                        <Ionicons name="sync-outline" size={20} color={theme.textColor} />
                    </Animated.View>
                    <Text style={styles.text}>{loadingText}</Text>
                </View>
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
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
    buttonDisabled: {
        opacity: 0.7,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingIcon: {
        marginRight: 8,
    },
    text: {
        color: theme.textColor,
        fontSize: 16,
        fontFamily: theme.semibold,
    },
});


export default ButtonFit;