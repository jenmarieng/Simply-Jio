import React, { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "@firebase/auth";
import { firebaseAuth } from "../FirebaseConfig";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import loginpage from "./authScreens/loginpage";
import drawerNav from "./navigation/drawerNav";
import signuppage from "./authScreens/signuppage";

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
    <Stack.Navigator initialRouteName="authScreens/loginpage">
      {user ? <Stack.Screen name="navigation/drawerNav" component={drawerNav} options={{ headerShown: false }} />
        :
        <>
        <Stack.Screen name="authScreens/loginpage" component={loginpage} options={{ headerShown: false }} />
        <Stack.Screen name="authScreens/signuppage" component={signuppage} options={{ headerShown: false }} />
        </>
      }
    </Stack.Navigator>
  );
}