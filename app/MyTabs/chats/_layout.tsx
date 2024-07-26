import { StyleSheet } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import index from './index';
import chatGroup from './chatGroup';
import chatDetails from './chatDetails';

const Stack = createNativeStackNavigator();

const Chats = () => {

  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatLists" component={index} options={{ headerShown: false }} />
      <Stack.Screen name="ChatGroup" component={chatGroup} options={{ headerShown: false }} />
      <Stack.Screen name="ChatDetails" component={chatDetails} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d1ffbd',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default Chats;