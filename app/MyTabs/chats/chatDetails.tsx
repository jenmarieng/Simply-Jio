import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, TextInput, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { RouteProp, useRoute } from '@react-navigation/native';
import { getEventData } from '../../../components/eventService';
import { addUserToChat, deleteChatGroup, leaveChatGroup } from '../../../components/chatService';
import Icon from 'react-native-vector-icons/Ionicons';
import { firebaseAuth } from '../../../FirebaseConfig';

type RootStackParamList = {
    ChatDetails: { id: string };
};

type ChatDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ChatDetails'>;

const ChatDetails = () => {
    const route = useRoute<ChatDetailsScreenRouteProp>();
    const navigation = useNavigation() as any;
    const { id } = route.params;
    const [creator, setCreator] = useState<{ userId: string; username: string; email: string; displayName: string } | null>(null);
    const [participants, setParticipants] = useState<{ userId: string; username: string; email: string; displayName: string }[]>([]);
    const [participantUsername, setParticipantUsername] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isLeaveModalVisible, setIsLeaveModalVisible] = useState(false);

    const user = firebaseAuth.currentUser;
    if (!user) {
        console.log('User not logged in');
        return null;
    }

    useEffect(() => {
        const fetchGroup = async () => {
            const chatData = await getEventData('groups', id);

            if (chatData) {
                setCreator(chatData.creator[0]);
                setParticipants(chatData.participants.filter((p: any) => p.userId !== chatData.creator[0].userId));
            }
        };

        fetchGroup();
    }, [id]);

    const renderParticipant = ({ item }: { item: { username: string; displayName: string } }) => (
        <View style={styles.participantContainer}>
            <Text style={styles.participantText}>{item.username} ({item.displayName})</Text>
        </View>
    );

    const handleCloseEvent = () => {
        setIsModalVisible(false);
        setParticipantUsername('');
    };

    const addUser = () => {
        addUserToChat(id, participantUsername);
        handleCloseEvent();
        navigation.goBack();
    };

    const handleDeleteChatGroup = async () => {
        await deleteChatGroup(id);
        setIsDeleteModalVisible(false);
        navigation.replace('ChatLists');
    }

    const handleLeaveChatGroup = async () => {
        await leaveChatGroup(id);
        setIsLeaveModalVisible(false);
        navigation.replace('ChatLists');
    }

    return (
        <View style={styles.container}>
            <Pressable onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={28} color="grey" />
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
                        placeholder="Participant's Username"
                        value={participantUsername}
                        onChangeText={setParticipantUsername}
                    />
                    <Pressable style={styles.addParticipantButton} onPress={addUser}>
                        <Text style={{ color: 'white' }}>Add Participant</Text>
                    </Pressable>
                </View>
            </Modal>
            <View style={styles.creatorRow}>
                <Text style={styles.label}>Participants</Text>
                <Pressable onPress={() => setIsModalVisible(true)}>
                    <Icon name="person-add-outline" size={24} color="grey" />
                </Pressable>
            </View>
            {creator && (
                <View style={styles.participantContainer}>
                    <View style={styles.creatorRow}>
                        <Text style={styles.creatorText}>{creator.username} ({creator.displayName})</Text>
                        <Text style={styles.creatorLabel}>creator</Text>
                    </View>
                </View>
            )}
            <FlatList
                data={participants}
                renderItem={renderParticipant}
                keyExtractor={(item) => item.userId}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={isDeleteModalVisible}
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => { setIsDeleteModalVisible(false) }}>
                            <Icon name="close-outline" size={26} color="grey" />
                        </TouchableOpacity>
                        <Text>Are you sure you want to delete this group?</Text>
                        <Pressable style={styles.deleteGroupButton} onPress={() => handleDeleteChatGroup()}>
                            <Text style={{ color: 'white', alignSelf: 'center' }}>Yes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isLeaveModalVisible}
                onRequestClose={() => setIsLeaveModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => { setIsLeaveModalVisible(false) }}>
                            <Icon name="close-outline" size={26} color="grey" />
                        </TouchableOpacity>
                        <Text>Are you sure you want to leave this group?</Text>
                        <Pressable style={styles.deleteGroupButton} onPress={() => handleLeaveChatGroup()}>
                            <Text style={{ color: 'white', alignSelf: 'center' }}>Yes</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            {creator?.userId == user.uid ?
                <>
                    <Pressable style={styles.deleteLeaveGroupButton} onPress={() => setIsDeleteModalVisible(true)}>
                        <Text style={{ color: 'white', fontSize: 16 }}>DELETE GROUP</Text>
                    </Pressable>
                </>
                :
                <>
                    <Pressable style={styles.deleteLeaveGroupButton} onPress={() => setIsLeaveModalVisible(true)}>
                        <Text style={{ color: 'white', fontSize: 16 }}>LEAVE GROUP</Text>
                    </Pressable>
                </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    modalView: {
        margin: 20,
        backgroundColor: '#dcae96',
        borderRadius: 20,
        padding: 15,
        marginTop: '35%',
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
    addParticipantButton: {
        padding: 5,
        backgroundColor: 'grey',
    },
    creatorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        paddingVertical: 5,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'gray',
    },
    creatorText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    creatorLabel: {
        fontSize: 16,
        color: 'gray',
    },
    participantContainer: {
        paddingVertical: 5,
    },
    participantText: {
        fontSize: 16,
    },
    deleteLeaveGroupButton: {
        padding: 10,
        backgroundColor: '#cc0000',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: '#e5d3b8',
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    deleteGroupButton: {
        padding: 4,
        width: 40,
        borderRadius: 5,
        backgroundColor: '#a09380',
        alignSelf: 'center',
        marginTop: 8,
    },
});

export default ChatDetails;