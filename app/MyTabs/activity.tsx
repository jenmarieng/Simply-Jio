import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  }
});

const Activities = () => {
  return (
    <View style={styles.text}>
      <Text>There will be activity suggestions here!</Text>
    </View>
  )
}

export default Activities;