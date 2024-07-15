import { firebaseAuth, db } from '../FirebaseConfig';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { doc, updateDoc, query, where, collection, getDocs, setDoc, getDoc, addDoc } from 'firebase/firestore';

/* not working yet
const updateUserDisplayName = async (userId: string, newDisplayName: string) => {
    try {
        const groupsCollection = collection(db, 'groups');
        const groupsQ = query(groupsCollection, where('userId', '==', userId));
        const groupsQuerySnapshot = await getDocs(groupsQ);
        groupsQuerySnapshot.forEach(async (docSnapshot) => {
            await updateDoc(doc(db, 'users', docSnapshot.id), { displayName: newDisplayName });
        });

        const eventsCollection = collection(db, 'events');
        const eventsQ = query(eventsCollection, where('userId', '==', userId));
        const eventsQuerySnapshot = await getDocs(eventsQ);
        eventsQuerySnapshot.forEach(async (docSnapshot) => {
            await updateDoc(doc(db, 'users', docSnapshot.id), { displayName: newDisplayName });
        });
        console.log('User details updated successfully in all documents');
        alert('User details updated successfully in all documents');
    } catch (error) {
        alert('Error updating user details!');
        console.error('Error updating user details:', error);
    }
};

const updateUserDisplayName = async (userId: any, newDisplayName: any) => {
    try {
        const groupsCollection = collection(db, 'groups');
        const groupsQ = query(groupsCollection, where('userId', '==', userId));
        const groupsQuerySnapshot = await getDocs(groupsQ);

        for (const docSnapshot of groupsQuerySnapshot.docs) {
            await updateDoc(docSnapshot.ref, { displayName: newDisplayName });
        }

        const eventsCollection = collection(db, 'events');
        const eventsQuerySnapshot = await getDocs(eventsCollection);

        for (const docSnapshot of eventsQuerySnapshot.docs) {
            const eventData = docSnapshot.data();
            let updated = false;

            const updatedCreator = eventData.creator.map((user: any) => {
                if (user.userId === userId) {
                    updated = true;
                    return { ...user, displayName: newDisplayName };
                }
                return user;
            });

            const updatedParticipants = eventData.participants.map((participant: any) => {
                if (participant.userId === userId) {
                    updated = true;
                    return { ...participant, displayName: newDisplayName };
                }
                return participant;
            });

            if (updated) {
                await updateDoc(docSnapshot.ref, {
                    creator: updatedCreator,
                    participants: updatedParticipants,
                });
                console.log('User firestore details updated');
            }
        }

        alert('User details updated successfully in all documents');
    } catch (error) {
        alert('Error updating user details!');
        console.error('Error updating user details:', error);
    }
};


const updateUsername = async (userId: string, newUserame: string) => {
    try {
        const groupsCollection = collection(db, 'groups');
        const groupsQ = query(groupsCollection, where('userId', '==', userId));
        const groupsQuerySnapshot = await getDocs(groupsQ);
        groupsQuerySnapshot.forEach(async (docSnapshot) => {
            await updateDoc(doc(db, 'users', docSnapshot.id), { username: newUserame });
        });

        const eventsCollection = collection(db, 'events');
        const eventsQ = query(eventsCollection, where('userId', '==', userId));
        const eventsQuerySnapshot = await getDocs(eventsQ);
        eventsQuerySnapshot.forEach(async (docSnapshot) => {
            await updateDoc(doc(db, 'users', docSnapshot.id), { username: newUserame });
        });
        console.log('User details updated successfully in all documents');
        alert('User details updated successfully in all documents');
    } catch (error) {
        alert('Error updating user details!');
        console.error('Error updating user details:', error);
    }
};

const updateUserEmail = async (userId: string, newEmail: string) => {
    try {
        const groupsCollection = collection(db, 'groups');
        const groupsQ = query(groupsCollection, where('userId', '==', userId));
        const groupsQuerySnapshot = await getDocs(groupsQ);
        groupsQuerySnapshot.forEach(async (docSnapshot) => {
            await updateDoc(doc(db, 'users', docSnapshot.id), { email: newEmail });
        });

        const eventsCollection = collection(db, 'events');
        const eventsQ = query(eventsCollection, where('userId', '==', userId));
        const eventsQuerySnapshot = await getDocs(eventsQ);
        eventsQuerySnapshot.forEach(async (docSnapshot) => {
            await updateDoc(doc(db, 'users', docSnapshot.id), { email: newEmail });
        });

        alert('User details updated successfully in all documents');
    } catch (error) {
        alert('Error updating user details!');
        console.error('Error updating user details:', error);
    }
};
*/

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

export const handleUpdateDisplayName = async (displayName: string) => {
    const user = firebaseAuth.currentUser;

    if (!user) {
        return null;
    };

    if (displayName === user.displayName) {
        alert('Display name is already set to ' + displayName);
        return;
    } else if (!displayName) {
        alert('Display name cannot be empty');
        return;
    } else try {
        await updateProfile(user, {
            displayName,
        });
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                displayName: user.displayName,
                email: user.email,
            });
        } else {
            await updateDoc(userRef, {
                displayName,
            });
        };
        //updateUserDisplayName(user.uid, displayName);
        await user.reload();
        alert('Display name updated successfully');
    } catch (error) {
        alert('Error updating name!');
        console.error('Error updating display name:', error);
    }
};

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
        /*
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert('Username already exists!');
            return null;
        }*/
        checkIfUsernameExists(username);
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
        //updateUsername(user.uid, username);
        await user.reload();
        alert('Username updated successfully');
    } catch (error) {
        alert('Error updating username!');
        console.error('Error updating username:', error);
    }
};

export const handleUpdateEmail = async (newEmail: string) => {
    const user = firebaseAuth.currentUser;

    if (!user) {
        return null;
    }

    if (newEmail === user.email) {
        alert('Email is already set to ' + newEmail);
        return;
    } else if (!newEmail) {
        alert('Email cannot be empty');
        return;
    } else try {
        await updateEmail(user, newEmail);
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            email: newEmail,
        });
        //updateUserEmail(user.uid, newEmail);
        await user.reload();
        alert('Email updated successfully');
    } catch (error) {
        alert('Error updating email!');
        console.error('Error updating email:', error);
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

export const saveBirthday = async (birthday: Date) => {
    const user = firebaseAuth.currentUser;

    if (!user) {
        return null;
    }

    const userRef = doc(db, 'users', user.uid);
    try {
        await updateDoc(userRef, {
            birthday,
        });
        alert('Birthday updated successfully');
    } catch (error) {
        alert('Error updating birthday!');
        console.error('Error updating birthday:', error);
    }
};

export const getBirthday = async () => {
    const user = firebaseAuth.currentUser;

    if (!user) {
        return null;
    }

    const q = doc(db, 'users', user.uid);
    try {
        const userDoc = await getDoc(q);
        if (userDoc.exists()) {
            if (!userDoc.data().birthday) {
                return null;
            }
            console.log('Birthday:', userDoc.data().birthday.toDate());
            return userDoc.data().birthday.toDate();
        }
    } catch (error) {
        console.error('Error retrieving birthday:', error);
    }
};