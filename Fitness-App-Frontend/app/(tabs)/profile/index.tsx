import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface PersonComponentProps {
    name: string;
    email: string;
    avatar?: string;
}

const ProfileScreen : React.FC<PersonComponentProps> = ({ name, email, avatar }) => {
    return (
        <View style={styles.container}>
            <Image 
                source={{ uri: avatar || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
            />
            <View style={styles.info}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.email}>{email}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
});

export default ProfileScreen;