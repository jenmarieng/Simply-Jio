import { db, firebaseAuth } from '../FirebaseConfig';
import { collection, addDoc, getDocs, query, doc, getDoc, where, updateDoc, arrayUnion, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getUsername } from './userService';

export const startGroup = async (groupName: string) => {
    const user = firebaseAuth.currentUser;
    if (!user) {
        console.log('User not logged in');
        return null;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.data();

    if (!userData) {
        console.log('User data not found');
        return null;
    }

    if (!user.displayName) {
        alert('Please set a display name first!');
        return null;
    }

    const groupRef = collection(db, 'groups');
    if (groupRef) {
        try {
            await addDoc(groupRef, {
                name: groupName || `Group #${Math.floor(Math.random() * 1000)}`,
                description: 'Chat group',
                creator: [{ userId: user.uid, displayName: user.displayName, email: user.email, username: userData.username }],
                participants: [{ userId: user.uid, displayName: user.displayName, email: user.email, username: userData.username }],
            });
        } catch (error) {
            console.log('error creating group', error);
        }
    } else {
        console.log('groupsCollectionRef is null');
    }
};

export const getUserGroups = (userId: string, callback: (groups: any[]) => void) => {
    const groupsRef = collection(db, 'groups');

    const unsubscribe = onSnapshot(groupsRef, (snapshot) => {
        const allGroups: any[] = [];

        snapshot.forEach(doc => {
            allGroups.push({ id: doc.id, ...doc.data() });
        });

        // Filter groups where user is a participant or creator
        const userEvents = allGroups.filter(groups =>
            groups.creator === userId ||
            groups.participants.some((participant: any) => participant.userId === userId)
        );

        callback(userEvents);
    });

    return unsubscribe;
};


export const addUserToChat = async (groupId: string, participantUsername: string) => {
    if (!participantUsername) {
        alert('Please enter a username.');
        return;
    }
    try {
        const chatRef = doc(db, 'groups', groupId);
        const docSnap = await getDoc(chatRef);
        if (!docSnap.exists()) {
            throw new Error('Event does not exist');
        }

        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('username', '==', participantUsername));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert('User does not exist!');
            return null;
        }

        const chatData = docSnap.data();
        const participantDoc = querySnapshot.docs[0];
        const participantId = participantDoc.id;
        const participantData = participantDoc.data();
        const existingParticipant = chatData.participants.find((participant: any) => participant.userId === participantId);
        if (!existingParticipant) {
            await updateDoc(chatRef, {
                participants: arrayUnion({ userId: participantId, displayName: participantData.displayName || 'Anonymous', email: participantData.email, username: participantData.username }),
            });
            alert('User added to chat!');
        } else {
            alert('User is already a chat participant.');
        }
        return docSnap.data();
    } catch (error) {
        console.error('Error adding user to chat:', error);
        alert('Error adding user to chat!');
        return null;
    }
};

export const getChatId = async (eventId: string) => {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('JioGroupId', '==', eventId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    } else {
        return null;
    };
};

export const addUserIfNotInChat = async (chatId: string) => {
    const user = firebaseAuth.currentUser;
    if (!user) {
        return null;
    }

    const username = await getUsername(user.uid);

    const groupsRef = collection(db, 'groups', chatId, 'participants');
    const q = query(groupsRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        try {
            await updateDoc(doc(db, 'groups', chatId), {
                participants: arrayUnion({ userId: user.uid, displayName: user.displayName || 'Anonymous', email: user.email, username }),
            });
        } catch (error) {
            console.log('Error adding user to chat:', error);
        }
    };
};

export const startGroupFromJio = async (groupName: string, eventId: string) => {
    //obtain participants data from event
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
        console.log('Event does not exist');
        return null;
    }

    const eventData = eventSnap.data();
    const participants = eventData.participants || [];

    //startGroup
    const user = firebaseAuth.currentUser;
    if (!user) {
        console.log('User not logged in');
        return null;
    }

    if (!user.displayName) {
        alert('Please set a display name first!');
        return null;
    }
    const username = await getUsername(user.uid);
    const groupRef = collection(db, 'groups');
    if (groupRef) {
        try {
            await addDoc(groupRef, {
                name: groupName || `Group #${Math.floor(Math.random() * 1000)}`,
                description: 'Chat group created from Jio Group',
                creator: [{ userId: user.uid, displayName: user.displayName, email: user.email, username }],
                participants,
                JioGroupId: eventId,
            });
            alert('Chat group created successfully');
        } catch (error) {
            console.log('error creating group', error);
        }
        const chatId = await getChatId(eventId);
        return chatId;
    } else {
        console.log('groupsCollectionRef is null');
    }
};

export const checkIsChatCreated = async (eventId: string) => {
    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where('JioGroupId', '==', eventId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return false;
    } else {
        return true;
    }
};

export const getChatName = async (chatId: string) => {
    const chatRef = doc(db, 'groups', chatId);
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
        console.log('Chat does not exist');
        return null;
    }
    const chatData = chatSnap.data();
    if (!chatData) {
        console.log('Chat data not found');
        return null;
    }
    return chatData.name;
};

export const deleteChatGroup = async (chatId: string) => {
    const user = firebaseAuth.currentUser;
    if (!user) {
        return null;
    }

    try {
        const chatRef = doc(db, 'groups', chatId);
        await deleteDoc(chatRef);
        alert('Chat Group deleted');
    } catch (error) {
        console.error('Error deleting Chat Group: ', error);
    }
};

export const leaveChatGroup = async (chatId: string) => {
    const user = firebaseAuth.currentUser;
    if (!user) {
        return null;
    }

    try {
        const chatRef = doc(db, 'groups', chatId);
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
            console.log('Chat does not exist');
            return null;
        }

        const chatData = chatSnap.data();
        if (!chatData) {
            console.log('Chat data not found');
            return null;
        }

        const updatedParticipants = chatData.participants.filter((participant: any) => participant.userId !== user.uid);
        await updateDoc(chatRef, {
            participants: updatedParticipants,
        });
        alert('You have left the chat group');
    } catch (error) {
        console.error('Error leaving Chat Group: ', error);
    }
}