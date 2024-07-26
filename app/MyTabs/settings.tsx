import * as React from 'react';
import { useState } from 'react';
import { Pressable, View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { handleUpdateDisplayName, handleUpdateUsername, handleUpdateEmail, handleUpdatePassword } from '../../components/userService';

const Settings = () => {
  const [displayName, setDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [username, setUsername] = useState('');

    return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          value={displayName}
          style={styles.input}
          placeholder="Enter your new display name"
          onChangeText={(text) => setDisplayName(text)}
        />
        <Pressable style={styles.updateButton} onPress={() => { handleUpdateDisplayName(displayName), setDisplayName('') }}>
          <Text>Update display name</Text>
        </Pressable>
        <TextInput
          value={username}
          style={styles.input}
          placeholder="Enter your new username"
          onChangeText={(text) => setUsername(text)}
        />
        <Pressable style={styles.updateButton} onPress={() => { handleUpdateUsername(username), setUsername('') }}>
          <Text>Update username</Text>
        </Pressable>
        <TextInput
          value={newEmail}
          style={styles.input}
          placeholder="Enter your new email"
          onChangeText={(text) => setNewEmail(text)}
          autoCapitalize='none'
        />
        <Pressable style={styles.updateButton} onPress={() => { handleUpdateEmail(newEmail), setNewEmail('') }}>
          <Text>Update email</Text>
        </Pressable>
        <TextInput
          value={newPassword}
          style={styles.input}
          placeholder="Enter your new password"
          onChangeText={(text) => setNewPassword(text)}
          autoCapitalize='none'
          secureTextEntry={true}
        />
        <Pressable style={styles.updateButton} onPress={() => { handleUpdatePassword(newPassword), setNewPassword('') }}>
          <Text>Update password</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    justifyContent: 'center',
    backgroundColor: 'wheat',
  },
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
});

export default Settings;