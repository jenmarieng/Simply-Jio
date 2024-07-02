import React, { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "@firebase/auth";
import { firebaseAuth } from "../FirebaseConfig";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import loginPage from "./authScreens/loginPage";
import signupPage from "./authScreens/signupPage";
import drawerNav from "./navigation/drawerNav";
import forgotPasswordPage from "./authScreens/forgotPasswordPage";
import forgotUsernamePage from "./authScreens/forgotUsernamePage";

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
    <Stack.Navigator initialRouteName="authScreens/loginPage">
      {user ? <Stack.Screen name="navigation/drawerNav" component={drawerNav} options={{ headerShown: false }} />
        :
        <>
        <Stack.Screen name="authScreens/loginPage" component={loginPage} options={{ headerShown: false }} />
        <Stack.Screen name="authScreens/signupPage" component={signupPage} options={{ headerShown: false }} />
        <Stack.Screen name="authScreens/forgotPasswordPage" component={forgotPasswordPage} options={{ headerShown: false }} />
        <Stack.Screen name="authScreens/forgotUsernamePage" component={forgotUsernamePage} options={{ headerShown: false }} />
        </>
      }
    </Stack.Navigator>
  );
}