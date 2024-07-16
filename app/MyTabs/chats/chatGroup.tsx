import { View, FlatList, StyleSheet, Button, TextInput, Text, KeyboardAvoidingView, Platform, Pressable, Modal, TouchableOpacity, Keyboard } from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { DocumentData, addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, QueryDocumentSnapshot } from 'firebase/firestore';
import { db, firebaseAuth } from '../../../FirebaseConfig';
import { addUserToChat } from '../../../components/chatService';
import { fetchLikedList } from '../../likes';
import Icon from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  ChatGroup: { id: string };
};

type ChatPageScreenRouteProp = RouteProp<RootStackParamList, 'ChatGroup'>;

const ChatPage = () => {
  const route = useRoute<ChatPageScreenRouteProp>();
  const { id } = route.params;
  //const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [message, setMessage] = useState<string>('');
  const [participantUsername, setParticipantUsername] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [likedList, setLikedList] = useState<{ id: string, name: string, address: string }[]>([]);
  const [isLikedListVisible, setIsLikedListVisible] = useState(false);

  const user = firebaseAuth.currentUser;

  if (!user) {
    return null;
  }

  useLayoutEffect(() => {
    const msgCollectionRef = collection(db, `groups/${id}/messages`);
    const q = query(msgCollectionRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (groups: DocumentData) => {
      const messages = groups.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        return { id: doc.id, ...doc.data() };
      });
      setMessages(messages);
    });
    return unsubscribe;
  }, []);

  useLayoutEffect(() => {
    const unsubscribe = fetchLikedList(user.uid, setLikedList);
    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    const msg = message.trim();
    if (msg.length === 0) return;

    const msgCollectionRef = collection(db, `groups/${id}/messages`);

    await addDoc(msgCollectionRef, {
      message: msg,
      senderId: user.uid,
      senderName: user.displayName,
      createdAt: serverTimestamp(),
    });

    setMessage('');
  };

  const renderMessage = ({ item }: { item: DocumentData }) => {
    const myMessage = item.senderId === user.uid;

    return (
      <View style={[styles.messageContainer, myMessage ? styles.userMessageContainer : styles.otherMessageContainer]}>
        <Text style={styles.messageText}>{item.senderName}: {item.message}</Text>
        <Text style={styles.time}>{item.createdAt?.toDate().toLocaleDateString()} @ {item.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
      </View>
    );
  };

  const renderLikedItem = ({ item }: { item: { id: string, name: string, address: string } }) => (
    <Pressable onPress={() => setMessage(`${item.name}, ${item.address}`)} style={styles.likedItem}>
      <Text>{item.name}</Text>
      <Text>{item.address}</Text>
    </Pressable>
  );
  

  const handleCloseEvent = () => {
    setIsModalVisible(false);
    setParticipantUsername('');
  };

  const addUser = () => {
    addUserToChat(id, participantUsername),
    handleCloseEvent();
  };

  const toggleLikedList = () => {
    setIsLikedListVisible(!isLikedListVisible);
    Keyboard.dismiss(); // Dismiss the keyboard when the liked list is toggled
  };

  return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={200}>
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
      {/*<Button title="View Participants" onPress={() => navigation.navigate('ChatDetails')} />*/}
      <Button title="Add Participant" onPress={() => setIsModalVisible(true)} />
      {isLikedListVisible && (
        <FlatList data={likedList} keyExtractor={(item) => item.id} renderItem={renderLikedItem} style={styles.likedList} />
      )}

        <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={renderMessage} />
        <View style={styles.inputContainer}>
          <TextInput multiline value={message} onChangeText={(text) => setMessage(text)} placeholder="Type a message" style={styles.messageInput} />
          <TouchableOpacity onPress={toggleLikedList} style={styles.heartIcon}>
            <Icon name="heart-outline" size={26} color="red" />
          </TouchableOpacity>
          <Button disabled={message === ''} title="Send" onPress={sendMessage} />
        </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    backgroundColor: '#fff',
  },
  messageInput: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  heartIcon: {
    marginLeft: 10,
  },
  messageContainer: {
    padding: 10,
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessageContainer: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
  },
  time: {
    fontSize: 12,
    color: '#777',
    alignSelf: 'flex-end',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#dcae96',
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
  addParticipantButton: {
    padding: 5,
    backgroundColor: 'grey',
  },
  likedItem: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  likedList: {
    maxHeight: '30%', // Limit the height of the liked list
  },
});

export default ChatPage;