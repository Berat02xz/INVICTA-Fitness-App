import { theme } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
    hasMoreInfo?: boolean;
    moreInfoColor?: string;
    moreInfoTitle?: string;
    moreInfoIcon?: string;
    moreInfoText?: string;
}

const ButtonFit: React.FC<ButtonFitProps> = ({ 
    title, 
    backgroundColor, 
    onPress, 
    style, 
    isLoading = false,
    loadingText = "Loading...",
    hasMoreInfo = false,
    moreInfoColor = "#C8E6C9",
    moreInfoTitle = "Info",
    moreInfoIcon = "information",
    moreInfoText = "Additional information"
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
        <View style={styles.outerWrapper}>
            {hasMoreInfo && (
                <View style={[styles.infoCardWrapper, { backgroundColor: moreInfoColor }]}>
                    <View style={styles.infoContent}>
                        <MaterialCommunityIcons 
                            name={moreInfoIcon as any} 
                            size={32} 
                            color="#333" 
                            style={styles.infoIcon}
                        />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>{moreInfoTitle}</Text>
                            <Text style={styles.infoUndertext}>{moreInfoText}</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={[styles.button, styles.infoButton, { backgroundColor: backgroundColor }]}
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
                </View>
            )}
            {!hasMoreInfo && (
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.standaloneButton, 
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
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    outerWrapper: {
        alignItems: 'center',
        alignSelf: 'center',
    },
    infoCardWrapper: {
        width: 332,
        borderRadius: 20,
        padding: 12,
        paddingBottom: 10,
    },
    infoContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    infoIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        color: '#333',
        fontSize: 16,
        fontFamily: theme.bold,
        marginBottom: 4,
    },
    infoUndertext: {
        color: '#666',
        fontSize: 13,
        fontFamily: theme.regular,
        lineHeight: 18,
    },
    button: {
        height: 62,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    standaloneButton: {
        width: 337,
    },
    infoButton: {
        width: '100%',
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
        color: theme.textColorTertiary,
        fontSize: 16,
        fontFamily: theme.medium,
    },
});


export default ButtonFit;