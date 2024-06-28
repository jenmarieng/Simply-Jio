import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import mainSchedulingScreen from './displayJios';
import AvailabilityScreen from './scheduleAvail';
type RootStackParamList = {
  mainSchedulingScreen: undefined;
  AvailabilityScreen: { eventId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
        <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: 'powderblue' } }}>
          <Stack.Screen
            name="mainSchedulingScreen"
            component={mainSchedulingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AvailabilityScreen"
            component={AvailabilityScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
  );
}

