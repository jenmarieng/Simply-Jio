/* to be implemented
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../FirebaseConfig';
import { RouteProp, useRoute } from '@react-navigation/native';

type RootStackParamList = {
    ChatDetails: { id: string };
};

type ChatDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ChatDetails'>;

const ChatDetails = () => {
    const route = useRoute<ChatDetailsScreenRouteProp>();
    const navigation = useNavigation();
    const { id } = route.params;
    const [group, setGroup] = useState<any>(null);

    useEffect(() => {
        const fetchGroup = async () => {
            const groupRef = doc(db, 'groups', id);
            const docSnap = await getDoc(groupRef);
            if (docSnap.exists()) {
                setGroup(docSnap.data());
            }
            console.log(docSnap);
            console.log('Group data:', docSnap.data());
        };

        fetchGroup();
    }, [id]);

    if (!group) {
        console.log('Group not found');
        return;
    }
    const creator = group.creator;
    const participants = group.participants || [];

    console.log('Group:' + group);
    console.log('Participants:' + group.participants);
    console.log('creator:' + group.creator);

    return (
        <View style={styles.container}>
            <Button title='back' onPress={() => navigation.goBack()} />
            <Text style={styles.groupName}>{group.name}</Text>
            {participants.length === 0 ? (
                <>
                <Text>No participants yet</Text>
                </>
            ) : (
                <FlatList
                    data={group.participants}
                    keyExtractor={(item) => item.userId}
                    renderItem={({ item }) => (
                        <View style={styles.participantContainer}>
                            <Text>Created by: {creator.displayName} {creator.username ? (creator.username) : creator.email }</Text>
                            <Text style={styles.participantText}>
                                {item.displayName} {item.username ? item.username : item.email}
                            </Text>
                        </View>
                    )}
                />)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    groupName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    participantContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    participantText: {
        fontSize: 18,
    },
});

export default ChatDetails;
*/