import { View, Text, TextInput, StyleSheet, ActivityIndicator, Button, KeyboardAvoidingView, ImageBackground } from 'react-native'
import React , { useState } from 'react'
import { firebaseAuth } from '../FirebaseAuthentication';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@firebase/auth';

const login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = firebaseAuth;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error: any) {
      console.log(error);
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      console.log(response);
      alert('Check your email!');
    } catch (error: any) {
      console.log(error);
      alert('Sign-up failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/images/startupImage.png')} resizeMode="cover" style={styles.image}>  
          <TextInput value={email} style={styles.input} placeholder="Enter your email" onChangeText={(text) => setEmail(text)} />
          <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder="Enter your password" onChangeText={(text) => setPassword(text)} />
          {loading ? (
            <ActivityIndicator size='large' color='#0000ff' />
          ) : (
            <>
              <Button title='Login' onPress={signIn} />
              <Button title='Sign up' onPress={signUp} />
            </>
          )}
      </ImageBackground>
    </View>
  );
}

export default login;

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
    marginBottom: 20,
    width: '60%',
    alignSelf: 'center',
  }
});
