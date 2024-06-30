import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db, firebaseAuth } from '../../../FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { startGroup, getUserGroups } from '../../../components/chatService';

const GroupsPage = () => {
    const navigation = useNavigation() as any;

    const [groups, setGroups] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [groupName, setGroupName] = useState('');
    const user = firebaseAuth.currentUser;

    if (!user) {
        console.log('User not logged in');
        return null;
    }

    useEffect(() => {
        if (!user) {
          console.log('User not logged in');
          return;
        };
        const unsubscribe = getUserGroups(user.uid, (userEvents) => {
          setGroups(userEvents);
        });
    
        return unsubscribe;
      }, [user]);

    const handleCloseEvent = () => {
        setGroupName('');
        setIsModalVisible(false);
    }

    const handleCreateGroup = () => {
        startGroup(groupName)
        setGroupName('');
        setIsModalVisible(false);
        alert('Group created!');
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                {groups.map((group) => (
                    <TouchableOpacity
                        key={group.id}
                        style={styles.groupCard}
                        onPress={() => { navigation.navigate('ChatGroup', { id: group.id }) }}
                    >
                        <Text>{group.name}</Text>
                        <Text style={{ color: '#696969' }}>{group.description}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Pressable style={styles.addGroup} onPress={() => setIsModalVisible(true)}>
                <Icon name="add" size={24} color="white" />
            </Pressable>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={handleCloseEvent}>
                        <Icon name="close-outline" size={26} color="black" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Group Name"
                        value={groupName}
                        onChangeText={setGroupName}
                    />
                    <Pressable style={styles.createGroupButton} onPress={handleCreateGroup}>
                        <Text style={{ color: 'white' }}>Create a New Group</Text>
                    </Pressable>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'darkseagreen',
        padding: 8,
    },
    addGroup: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#475e47',
        borderRadius: 30,
        elevation: 8,
    },
    groupCard: {
        padding: 10,
        marginBottom: 10,
        elevation: 1,
        borderRadius: 5,
        backgroundColor: '#ddeadd',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#ddeadd',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    input: {
        height: 40,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 12,
        width: '80%',
        paddingLeft: 8,
    },
    createGroupButton: {
        padding: 5,
        backgroundColor: 'black',
    },
});

export default GroupsPage;