import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Calendar from "../calendar";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'blanchedalmond',
  },
  text: {
    paddingTop: '10%',
    alignSelf: 'center',
    fontSize: 28,
  },
});

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome back.</Text>
      <Calendar/>
    </View>
  )
}

export default Home;