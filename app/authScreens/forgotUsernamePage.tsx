import { View, Text, ImageBackground, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const ForgotUsernameScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const signInWithEmail = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(firebaseAuth, email, password);
            console.log(response);
        } catch (error: any) {
            console.log(error);
            alert('Login failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const navigation = useNavigation() as any;

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../assets/images/startupImage.png')} resizeMode="cover" style={styles.image}>
                <Pressable style={styles.backButton} onPress={() => navigation.replace('authScreens/loginPage')}>
                    <Icon name="arrow-back" size={28} color="grey" />
                </Pressable>
                <TextInput value={email} style={[styles.input, { marginTop: '40%' }]} placeholder="Email" onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Password" onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                {loading ? (
                    <ActivityIndicator size='large' color='#0000ff' />
                ) : (
                    <>
                        <Pressable style={styles.forgotPasswordButton} onPress={() => navigation.navigate('authScreens/forgotPasswordPage')}>
                            <Text style={{ textDecorationLine: 'underline', color: 'red' }}>Forgot password?</Text>
                        </Pressable>
                        <Pressable style={styles.loginButton} onPress={signInWithEmail}>
                            <Text>LOGIN</Text>
                        </Pressable>
                    </>
                )}
            </ImageBackground>
        </View>
    );
}

export default ForgotUsernameScreen;

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
    loginButton: {
        alignItems: 'center',
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        elevation: 4,
        borderRadius: 4,
        backgroundColor: "limegreen",
    },
    forgotPasswordButton: {
        alignItems: 'center',
        alignSelf: 'center',
        paddingLeft: '35%',
        marginBottom: 15,
        borderRadius: 4,
    },
    backButton: {
        paddingStart: 15,
    },
});
