import { firebaseAuth } from "../FirebaseAuthentication";
import { signOut } from "firebase/auth"
import { View, StyleSheet, SafeAreaView, Button } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function Index() {

  const handleSignOut = async () => {
    try {
      await signOut(firebaseAuth);
      alert('You have signed out successfully.');
    } catch (error: any) {
      console.error('Error signing out: ', error);
      alert('An error occurred while signing out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Button onPress={handleSignOut} title="Log out" />
    </View>
  );
}