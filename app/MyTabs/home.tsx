import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import Calendar from "../../components/calendar";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'blanchedalmond',
  },
});

const Home = () => {
  return (
    <View style={styles.container}>
      <Calendar/>
    </View>
  )
}

export default Home;