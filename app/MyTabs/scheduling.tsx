import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    backgroundColor: 'powderblue',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  }
});

const Scheduling = () => {
  return (
    <View style={styles.text}>
      <Text>Schedule meetups with your friends!</Text>
    </View>
  )
}

export default Scheduling;