import * as React from 'react';
import { useState } from 'react';
import { Pressable, View, Text, StyleSheet, TextInput } from 'react-native';
import { firebaseAuth } from '../../FirebaseConfig';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';

const Settings = () => {
  const [displayName, setDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateDisplayName = async () => {
    try {
      if (firebaseAuth.currentUser) {
        await updateProfile(firebaseAuth.currentUser, {
          displayName: displayName,
        })
        await firebaseAuth.currentUser.reload();
        alert('Display name updated successfully');
      }
    } catch (error) {
      alert('Error updating name!');
      console.error('Error updating display name:', error);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      if (firebaseAuth.currentUser) {
        await updateEmail(firebaseAuth.currentUser, newEmail)
        await firebaseAuth.currentUser.reload();
        alert('Email updated successfully');
      }
    } catch (error) {
      alert('Error updating email!');
      console.error('Error updating email:', error);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (firebaseAuth.currentUser) {
        await updatePassword(firebaseAuth.currentUser, newPassword)
        await firebaseAuth.currentUser.reload();
        alert('Password updated successfully');
      }
    } catch (error) {
      alert('Error updating password!');
      console.error('Error updating password:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={displayName}
        style={styles.input}
        placeholder="Enter your display name"
        onChangeText={(text) => setDisplayName(text)}
      />
      <Pressable style={styles.updateButton} onPress={handleUpdateDisplayName}>
        <Text>Update display name</Text>
      </Pressable>
      <TextInput
        value={newEmail}
        style={styles.input}
        placeholder="Enter your new email"
        onChangeText={(text) => setNewEmail(text)}
      />
      <Pressable style={styles.updateButton} onPress={handleUpdateEmail}>
        <Text>Update email</Text>
      </Pressable>
      <TextInput
        value={newPassword}
        style={styles.input}
        placeholder="Enter your new password"
        onChangeText={(text) => setNewPassword(text)}
      />
      <Pressable style={styles.updateButton} onPress={handleUpdatePassword}>
        <Text>Update password</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  updateButton: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    elevation: 4,
    borderRadius: 4,
    backgroundColor: "burlywood",
  },
  input: {
    backgroundColor: 'beige',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    width: '60%',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'wheat',
  },
});

export default Settings;