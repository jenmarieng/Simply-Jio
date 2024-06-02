import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    backgroundColor: 'plum',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  }
});

const Food = () => {
  return (
    <View style={styles.text}>
      <Text>There will be food suggestions here!</Text>
    </View>
  )
}
export default Food;