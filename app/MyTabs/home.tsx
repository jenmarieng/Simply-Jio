import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'blanchedalmond',
  },
  text: {
    paddingBottom: '80%',
    alignSelf: 'center',
    fontSize: 28,
  }
});

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome back.</Text>
    </View>
  )
}


export default Home;