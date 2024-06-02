import { View, Text, ImageBackground, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../FirebaseAuthentication';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = firebaseAuth;
    const createUser = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response);
            alert('Account has been created! You will be logged in.');
        } catch (error: any) {
            console.log(error);
            alert('Sign-up failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../assets/images/startupImage.png')} resizeMode="cover" style={styles.image}>
                <Text style={styles.text}>Register for an account now!</Text>
                <TextInput value={email} style={styles.input} placeholder="Enter your email" onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Enter your password" onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                {loading ? (
                    <ActivityIndicator size='large' color='#0000ff' />
                ) : (
                    <>
                        <Pressable style={styles.signupButton} onPress={createUser}>
                            <Text>CREATE ACCOUNT</Text>
                        </Pressable>
                    </>
                )}
            </ImageBackground>
        </View>
    );
}

export default SignUp

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        backgroundColor: '#ffdab9',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        width: '60%',
        alignSelf: 'center',
    },
    signupButton: {
        alignItems: 'center',
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        elevation: 4,
        borderRadius: 4,
        backgroundColor: "limegreen",
    },
    text: {
        marginTop: '20%',
        marginBottom: '8%',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 25,
    }
});
