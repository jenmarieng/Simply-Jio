import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Search = () => {
  return (
    <View style={styles.text}>
      <Text>Search for your friends' profiles here!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    backgroundColor: '#d1ffbd',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  }
});

export default Search;