import { View, Text, ImageBackground, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { saveNewUser, checkIfUsernameExists } from '../../components/userService';

const SignUp = () => {
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const checkPassword = () => {
        if (password === confirmPassword) {
            setLoading(true);
            return true;
        } else {
            alert('Passwords do not match!');
            return false;
        }
    };

    const createUser = async () => {
        if (!username || !displayName || !email || !password || !confirmPassword) {
            alert('Please do not leave any fields empty!');
            return;
        }
        if (await checkIfUsernameExists(username)) {
            alert('Username already exists!');
            return;
        }
        if (checkPassword()) {
            try {
                const response = await createUserWithEmailAndPassword(firebaseAuth, email, confirmPassword);
                saveNewUser(username, displayName);
                console.log(response);
                alert('Account has been created! You will be logged in.');
            } catch (error: any) {
                console.log(error);
                alert('Sign-up failed: ' + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const navigation = useNavigation() as any;

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../assets/images/startupImage.png')} resizeMode="cover" style={styles.image}>
                <Pressable style={styles.backButton} onPress={() => navigation.replace('authScreens/loginPage')}>
                    <Icon name="arrow-back" size={28} color="grey" />
                </Pressable>
                <TextInput value={displayName} style={styles.input} placeholder="Display Name" onChangeText={(text) => setDisplayName(text)} />
                <TextInput value={username} style={styles.input} placeholder="Username" onChangeText={(text) => setUsername(text)} autoCapitalize='none' />
                <TextInput value={email} style={styles.input} placeholder="Email" onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Password" onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
                <TextInput secureTextEntry={true} value={confirmPassword} style={styles.input} placeholder="Confirm password" onChangeText={(text) => setConfirmPassword(text)} autoCapitalize='none' />
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
        backgroundColor: '#ffd0a5',
        borderRadius: 15,
        padding: 12,
        marginBottom: 13,
        width: '60%',
        alignSelf: 'center',
        fontSize: 14,
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
    backButton: {
        paddingStart: 15,
        paddingTop: '18%',
        paddingBottom: '17%',
    },
});
