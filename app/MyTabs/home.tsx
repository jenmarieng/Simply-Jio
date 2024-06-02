import { View, Text, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Calendar from "../calendar";

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
  const [selected, setSelected] = useState('');  
  const uniFriends = {key: 'uniFriends', color: 'red', selectedDotColor: '#ffc0cb'};
  const polyFriends = {key: 'polyFriends', color: '#d2bd0a', selectedDotColor: '#ffc0cb'};
  const holidayFriends = {key: 'holidayFriends', color: 'green', selectedDotColor: '#ffc0cb'};

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome back.</Text>
      <Calendar />
    </View>
  )
}


export default Home;