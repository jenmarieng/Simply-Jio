import { db, firebaseAuth } from '../FirebaseConfig';
import { collection, addDoc, getDocs, query, doc, getDoc, where, updateDoc, arrayUnion, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

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

    const groupRef = collection(db, 'groups');
    if (groupRef) {
        try {
            await addDoc(groupRef, {
                name: groupName || `Group #${Math.floor(Math.random() * 1000)}`,
                description: 'Chat group',
                creator: [{ userId: user.uid, displayName: user.displayName || 'Anonymous', username: userData.username, email: user.email }],
                participants: [{ userId: user.uid, displayName: user.displayName || 'Anonymous', username: userData.username, email: user.email }],
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
                participants: arrayUnion({ userId: participantId, name: participantData.displayName || 'Anonymous', username: participantUsername, email: participantData.email }),
            });
            alert('Participant added to chat!');
        } else {
            alert('Participant is already added to chat!');
        }
        return docSnap.data();
    } catch (error) {
        console.error('Error adding user to chat:', error);
        alert('Error adding user to chat!');
        return null;
    }
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

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.data();

    if (!userData) {
        console.log('User data not found');
        return null;
    }

    const groupRef = collection(db, 'groups');
    if (groupRef) {
        try {
            await addDoc(groupRef, {
                name: groupName || `Group #${Math.floor(Math.random() * 1000)}`,
                description: 'Chat group created from Jio Group',
                creator: [{ userId: user.uid, displayName: user.displayName || 'Anonymous', username: userData.username, email: user.email }],
                participants,
            });
            alert('Chat group created successfully');
        } catch (error) {
            console.log('error creating group', error);
        }
        return groupRef.id;
    } else {
        console.log('groupsCollectionRef is null');
    }
};