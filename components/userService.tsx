import { firebaseAuth, db } from '../FirebaseConfig';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, updateDoc, query, where, collection, getDocs, setDoc, getDoc } from 'firebase/firestore';

const updateUserDisplayName = async (userId: string, newName: string) => {
    try {
        //Update display name in groups collection
        const groupsCollection = collection(db, 'groups');
        const groupsQuerySnapshot = await getDocs(groupsCollection);
        groupsQuerySnapshot.forEach(async (docSnapshot) => {
            const groupData = docSnapshot.data();
            let shouldUpdate = false;
            const updatedGroupData = { ...groupData };

            if (groupData.creator) {
                updatedGroupData.creator = groupData.creator.map((creator: any) => {
                    if (creator.userId === userId) {
                        shouldUpdate = true;
                        return { ...creator, displayName: newName };
                    }
                    return creator;
                });
            }

            if (groupData.participants) {
                updatedGroupData.participants = groupData.participants.map((participant: any) => {
                    if (participant.userId === userId) {
                        shouldUpdate = true;
                        return { ...participant, displayName: newName };
                    }
                    return participant;
                });
            }

            if (shouldUpdate) {
                await updateDoc(doc(db, 'groups', docSnapshot.id), updatedGroupData);
                console.log("Display name updated successfully in group " + docSnapshot.id);
            }

            const messagesCollection = collection(db, 'groups', docSnapshot.id, 'messages');
            const messagesQ = query(messagesCollection, where('senderId', '==', userId));
            const messagesQuerySnapshot = await getDocs(messagesQ);
            messagesQuerySnapshot.forEach(async (messageDoc) => {
                await updateDoc(doc(db, 'groups', docSnapshot.id, 'messages', messageDoc.id), { senderName: newName });
                console.log("Display name updated successfully in messages " + messageDoc.id);
            });
        });

        //Update display name in events collection
        const eventsCollection = collection(db, 'events');
        const eventsQuerySnapshot = await getDocs(eventsCollection);
        eventsQuerySnapshot.forEach(async (docSnapshot) => {
            const eventData = docSnapshot.data();
            let shouldUpdate = false;
            const updatedEventData = { ...eventData };

            if (eventData.creator) {
                updatedEventData.creator = eventData.creator.map((creator: any) => {
                    if (creator.userId === userId) {
                        shouldUpdate = true;
                        return { ...creator, displayName: newName };
                    }
                    return creator;
                });
            }

            if (eventData.participants) {
                updatedEventData.participants = eventData.participants.map((participant: any) => {
                    if (participant.userId === userId) {
                        shouldUpdate = true;
                        return { ...participant, displayName: newName };
                    }
                    return participant;
                });
            }

            if (shouldUpdate) {
                await updateDoc(doc(db, 'events', docSnapshot.id), updatedEventData);
                console.log("Display name updated successfully in event " + docSnapshot.id);
            }

            const userAvailabilitiesCollection = collection(db, 'events', docSnapshot.id, 'userAvailabilities');
            const availabilitiesQ = query(userAvailabilitiesCollection, where('userId', '==', userId));
            const availabilitiesQuerySnapshot = await getDocs(availabilitiesQ);
            availabilitiesQuerySnapshot.forEach(async (availabilityDoc) => {
                await updateDoc(doc(db, 'events', docSnapshot.id, 'userAvailabilities', availabilityDoc.id), { displayName: newName });
                console.log("Display name updated successfully in userAvailabilities " + availabilityDoc.id);
            });
        });

        console.log('User details updated successfully in all documents');
    } catch (error) {
        console.error('Error updating user details:', error);
    }
};

export const handleUpdateDisplayName = async (displayName: string) => {
    const user = firebaseAuth.currentUser;

    if (!user) {
        console.log('No user is currently logged in.');
        return null;
    }

    if (displayName === user.displayName) {
        alert('Display name is already set to ' + displayName);
        return;
    } else if (!displayName) {
        alert('Display name cannot be empty');
        return;
    }

    try {
        console.log('Updating user profile displayName...');
        await updateProfile(user, {
            displayName,
        });

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.log('Creating new user document...');
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
            });
        } else {
            console.log('Updating existing user document...');
            await updateDoc(userRef, {
                displayName,
            });
            await updateUserDisplayName(user.uid, displayName);
        }

        await user.reload();
        alert('Display name updated successfully');
    } catch (error) {
        alert('Error updating name!');
        console.error('Error updating display name:', error);
    }
};

export const getUsername = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        return userDoc.data().username;
    }
};

export const checkIfUsernameExists = async (username: string) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        alert('Username already exists!');
        return true;
    } else {
        return false;
    }
};

export const saveNewUser = async (username: string, displayName: string) => {
    const user = firebaseAuth.currentUser;
    if (!user) {
        return null;
    }
    await updateProfile(user, {
        displayName,
    });
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
        username: username,
        email: user.email,
        displayName,
    })
};

export const getEmailFromUsername = async (username: string) => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    } else {
        return querySnapshot.docs[0].data().email;
    }
}

export const handleUpdateUsername = async (username: string) => {
    const user = firebaseAuth.currentUser;

    if (!user) {
        return null;
    }

    const currentUsername = await getUsername(user.uid);

    if (!username) {
        alert('Username cannot be empty');
        return;
    } else if (username == currentUsername) {
        alert('Username is already set to ' + username);
        return;
    } else try {
        if (await checkIfUsernameExists(username))
        {
            return;
        }
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                username: username,
                email: user.email,
                displayName: user.displayName || 'Anonymous',
            });
        } else {
            await updateDoc(userRef, {
                username,
                email: user.email,
                displayName: user.displayName || 'Anonymous',
            });
        }
        await user.reload();
        alert('Username updated successfully');
    } catch (error) {
        alert('Error updating username!');
        console.error('Error updating username:', error);
    }
};

export const handleUpdatePassword = async (newPassword: string) => {
    const user = firebaseAuth.currentUser;

    if (!user) {
        return null;
    }

    if (!newPassword) {
        alert('Password cannot be empty');
        return;
    } else try {
        await updatePassword(user, newPassword);
        await user.reload();
        alert('Password updated successfully');
    } catch (error) {
        alert('Error updating password!');
        console.error('Error updating password:', error);
    }
};