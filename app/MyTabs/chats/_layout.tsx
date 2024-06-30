import { Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import index from './index';
import Icon from 'react-native-vector-icons/Ionicons';
import chatGroup from './chatGroup';
//import chatDetails from './chatDetails';

const Stack = createNativeStackNavigator();

const Chats = () => {
  const navigation = useNavigation() as any;

  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatLists" component={index} options={{ headerShown: false }} />
      <Stack.Screen name="ChatGroup" component={chatGroup} options={{
        headerTitle: 'Chat',
        headerLeft: () =>
          <Pressable onPress={() => navigation.replace('ChatLists')}>
            <Icon name="arrow-back" size={28} color="grey" />
          </Pressable>
      }} />
      {/*<Stack.Screen name="ChatDetails" component={chatDetails} options={{ headerShown: false }}/>*/}
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