import { Text, View, TextInput, StyleSheet, ActivityIndicator, Pressable, ImageBackground } from 'react-native'
import React, { useState } from 'react'
import { firebaseAuth } from '../../FirebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, fetchSignInMethodsForEmail } from '@firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getEmailFromUsername } from '../../components/userService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signInWithUsername = async () => {
    setLoading(true);
    try {
      const userEmail = await getEmailFromUsername(username);
      const response = await signInWithEmailAndPassword(firebaseAuth, userEmail, password);
      console.log(response);
    } catch (error: any) {
      console.log(error);
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /*
  const forgotPassword = async () => {
    try {
      let signInMethods = await fetchSignInMethodsForEmail(firebaseAuth, email);
      if (signInMethods.length > 0) {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent!');
      } else {
        alert('No account found with that email!');
      }
    } catch (error: any) {
      console.log(error);
      alert('Error resetting password: ' + error.message + 'Please try again.');
    }
  };*/

  const navigation = useNavigation() as any;

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../assets/images/startupImage.png')} resizeMode="cover" style={styles.image}>
        <TextInput value={username} style={[styles.input, { marginTop: '40%' }]} placeholder="Username" onChangeText={(text) => setUsername(text)} autoCapitalize='none' />
        <Pressable style={styles.forgotPasswordButton} onPress={() => navigation.navigate('authScreens/forgotUsernamePage')}>
          <Text style={{ textDecorationLine: 'underline', color: 'red' }}>Forgot username?</Text>
        </Pressable>
        <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Password" onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
        {loading ? (
          <ActivityIndicator size='large' color='#0000ff' />
        ) : (
          <>
            <Pressable style={styles.forgotPasswordButton} onPress={() => navigation.navigate('authScreens/forgotPasswordPage')}>
              <Text style={{ textDecorationLine: 'underline', color: 'red' }}>Forgot password?</Text>
            </Pressable>
            <Pressable style={styles.loginButton} onPress={signInWithUsername}>
              <Text>LOGIN</Text>
            </Pressable>
            <Text style={styles.text}>Don't have an account yet?</Text>
            <Pressable style={styles.signupButton} onPress={() => navigation.navigate('authScreens/signupPage')}>
              <Text>SIGNUP</Text>
            </Pressable>
          </>
        )}
      </ImageBackground>
    </View>
  );
}

export default Login;

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
  signupButton: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 4,
    backgroundColor: "paleturquoise",
  },
  forgotPasswordButton: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingLeft: '35%',
    marginBottom: 5,
    borderRadius: 4,
  },
  text: {
    paddingVertical: 10,
    paddingTop: '10%',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 15,
  }
});
