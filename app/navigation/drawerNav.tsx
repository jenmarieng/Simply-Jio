import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import index from "../index";
import settings from "../MyTabs/settings";
import { firebaseAuth, db } from "../../FirebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Image, StyleSheet, View, Text } from 'react-native';

const handleSignOut = async () => {
  try {
    await signOut(firebaseAuth);
    alert('You have signed out successfully.');
  } catch (error: any) {
    console.error('Error signing out: ', error);
    alert('An error occurred while signing out. Please try again.');
  }
};

const Drawer = createDrawerNavigator();

type User = {
  displayName: string | null;
  email: string | null;
};

function CustomDrawerContent(props: any) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('');

  const getUsername = (uid: string, callback: (username: string) => void) => {
    const userDocRef = doc(db, 'users', uid);
  
    return onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const username = userData.username;
        callback(username);
      }
    });
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = firebaseAuth.currentUser;
      if (!user) {
        return;
      }
      setCurrentUser(user);

      const unsubscribe = getUsername(user.uid, setUsername);

      return unsubscribe;
    };

    const unsubscribe = fetchCurrentUser();

    return () => {
      if (unsubscribe) {
        unsubscribe;
      }
    };
  }, []);

  const UserDetails = ({ user }: { user: User }) => {
    return (
      <View style={styles.userInfoWrapper}>
        <View style={styles.userDetailsWrapper}>
          <Text style={styles.text}>Logged in as</Text>
          <Text>Name: {user.displayName}</Text>
          <Text>Username: {username}</Text>
          <Text>{user.email}</Text>
        </View>
      </View>
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      {currentUser && <UserDetails user={currentUser} />}
      <DrawerItemList {...props} />
      <DrawerItem
        label="Log out"
        onPress={handleSignOut}
      />
    </DrawerContentScrollView>
  );
}

function LogoTitle() {
  return (
    <Image
      style={{ resizeMode: 'contain', width: 200, height: 50 }}
      source={require('../../assets/images/SJLogo.png')}
    />
  );
}

const styles = StyleSheet.create({
  userInfoWrapper: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  userDetailsWrapper: {
    marginLeft: 10,
  },
  text: {
    color: 'grey',
  }
});

export default function DrawerNav() {
  return (
    <Drawer.Navigator initialRouteName="SimplyJio!" drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="SimplyJio!" component={index} options={{ headerTitle: () => <LogoTitle />, headerTitleAlign: 'center' }} />
      <Drawer.Screen name="Settings" component={settings} />
    </Drawer.Navigator>
  )
}