import { View, Text, Button, StyleSheet } from 'react-native';
import React from 'react';
import { firebaseAuth } from "../../FirebaseAuthentication";
import { signOut } from "firebase/auth";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const handleSignOut = async () => {
  try {
    await signOut(firebaseAuth);
    alert('You have signed out successfully.');
  } catch (error: any) {
    console.error('Error signing out: ', error);
    alert('An error occurred while signing out. Please try again.');
  }
};

const Home = () => {
  return (
    <View style={styles.container}>
      <Text>home</Text>
      <Button onPress={handleSignOut} title="Log out" />
    </View>
  )
}

export default Home;