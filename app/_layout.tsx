import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "@firebase/auth";
import { firebaseAuth } from "@/FirebaseAuthentication";

export default function RootLayout() {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log(user);
    onAuthStateChanged(firebaseAuth, (user) => {
      console.log('user', user);
      setUser(user);
    });
  }, []);

  return (
    <Stack>
      { user ? (
        <Stack.Screen name="index" options = {{headerShown: false}} />
      ) : (
        <Stack.Screen name="login" options = {{headerShown: false}} />
      )}
      </Stack>
  );
}


