import React, { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "@firebase/auth";
import { firebaseAuth } from "@/FirebaseAuthentication";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import loginpage from "./loginpage";
import index from "./index";

const Stack = createNativeStackNavigator();

export default function RootLayout() {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      console.log('user', user);
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Stack.Navigator initialRouteName="loginpage">
      {user ? <Stack.Screen name="index" component={index} options={{ headerShown: false }} />
        :
        <Stack.Screen name="loginpage" component={loginpage} options={{ headerShown: false }} />
      }
    </Stack.Navigator>
  );
}
