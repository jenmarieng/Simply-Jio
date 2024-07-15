import { View, Text, StyleSheet, Pressable, ImageBackground, TextInput } from 'react-native'
import React, { useState } from 'react'
import { sendPasswordResetEmail } from '@firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseAuth, db } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation() as any;
    const [email, setEmail] = useState('');
    const forgotPassword = async () => {
        try {
            const usersCollection = collection(db, 'users');
            const q = query(usersCollection, where('email', '==', email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                await sendPasswordResetEmail(firebaseAuth, email);
                alert('Password reset email sent to ' + email + '!');
            } else {
                alert('No account found with that email!');
            }
        } catch (error: any) {
            console.log(error);
            alert('Error resetting password: ' + error.message + 'Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../assets/images/startupImage.png')} resizeMode="cover" style={styles.image}>
                <Pressable style={styles.backButton} onPress={() => navigation.replace('authScreens/loginPage')}>
                    <Icon name="arrow-back" size={28} color="grey" />
                </Pressable>
                <TextInput value={email} style={styles.input} placeholder="Email" onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                <Pressable style={styles.resetPasswordButton} onPress={forgotPassword}>
                    <Text>RESET PASSWORD</Text>
                </Pressable>
            </ImageBackground>
        </View>
    );
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        backgroundColor: '#ffd0a5',
        borderRadius: 15,
        padding: 12,
        marginBottom: 15,
        width: '60%',
        alignSelf: 'center',
        fontSize: 14,
    },
    resetPasswordButton: {
        alignItems: 'center',
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        elevation: 4,
        borderRadius: 4,
        backgroundColor: "limegreen",
    },
    backButton: {
        paddingStart: 15,
    },
});
