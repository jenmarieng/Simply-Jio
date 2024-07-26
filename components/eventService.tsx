import { db, firebaseAuth } from '../FirebaseConfig';
import { collection, addDoc, getDocs, query, doc, getDoc, where, updateDoc, arrayUnion, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getUsername } from '../components/userService';
import { addUserIfNotInChat, getChatId } from './chatService';
import { addDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const createEvent = async (name: string) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    console.log('User not logged in');
    return null;
  }
  if (!user.displayName) {
    alert('Please set a display name first!');
    return null;
  };

  const username = await getUsername(user.uid);
  const docRef = await addDoc(collection(db, 'events'), {
    name,
    creator: [{ userId: user.uid, displayName: user.displayName, email: user.email, username }],
    participants: [{ userId: user.uid, displayName: user.displayName, email: user.email, username }],
  });
  return docRef.id;
};

export const joinEvent = async (eventId: string) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    console.log('User not logged in');
    return null;
  }
  const eventRef = doc(db, 'events', eventId);
  const docSnap = await getDoc(eventRef);
  if (!docSnap.exists()) {
    throw new Error('Event does not exist');
  }
  const eventData = docSnap.data();
  const existingParticipant = eventData.participants.find((participant: any) => participant.userId === user.uid);
  const username = await getUsername(user.uid);

  if (!existingParticipant) {
    if (!user.displayName) {
      alert('Please set a display name first!');
      return null;
    }
    await updateDoc(eventRef, {
      participants: arrayUnion({ userId: user.uid, displayName: user.displayName, email: user.email, username }),
    });
    //add user to existing chat if chat has already been created from this jio group
    const chatId = await getChatId(eventId);
    if (chatId) {
      await addUserIfNotInChat(chatId);
    }
  }
  return docSnap.data();
};

export const addUserToJioGroup = async (eventId: string, participantUsername: string) => {
  if (!participantUsername) {
    alert('Please enter a username.');
    return;
  }
  try {
    const eventRef = doc(db, 'events', eventId);
    const docSnap = await getDoc(eventRef);
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

    const eventData = docSnap.data();
    const participantDoc = querySnapshot.docs[0];
    const participantId = participantDoc.id;
    const participantData = participantDoc.data();
    const existingParticipant = eventData.participants.find((participant: any) => participant.userId === participantId);
    if (!existingParticipant) {
      await updateDoc(eventRef, {
        participants: arrayUnion({ userId: participantId, displayName: participantData.displayName, email: participantData.email, username: participantData.username }),
      });
      alert('User added to Jio Group!');
    } else {
      alert('User is already a participant.');
    }
    return docSnap.data();
  } catch (error) {
    console.error('Error adding user to jio group:', error);
    alert('Error adding user to Jio Group!');
    return null;
  }
};

export const loadEvents = async () => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    return null;
  }
  const eventsCollection = collection(db, 'users', user.uid, 'JioEvents');
  try {
    const snapshot = await getDocs(eventsCollection);
    const events: { [key: string]: any[] } = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.date;
      if (!events[date]) {
        events[date] = [];
      }
      events[date].push({ ...data, id: doc.id });
    });
    return events;
  } catch (error) {
    console.error('Error loading events: ', error);
    return {};
  }
};

export const saveEvent = async (event: any) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    return null;
  }
  const eventsCollection = collection(db, 'users', user.uid, 'JioEvents');
  try {
    for (let date of event.multiDay) {
      await addDoc(eventsCollection, { ...event, date });
    }
  } catch (error) {
    console.error('Error saving event: ', error);
  }
};

export const deleteEvent = async (eventId: string) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    return null;
  }
  const eventsCollection = collection(db, 'users', user.uid, 'JioEvents');
  try {
    const eventsRef = doc(eventsCollection, eventId);
    await deleteDoc(eventsRef);
  } catch (error) {
    console.error('Error deleting event: ', error);
  }
};

export const updateEvent = async (eventId: string, updatedEvent: any) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    return null;
  }
  const eventsCollection = collection(db, 'users', user.uid, 'JioEvents');
  try {
    const eventsRef = doc(eventsCollection, eventId);
    await setDoc(eventsRef, updatedEvent, { merge: true });
  } catch (error) {
    console.error('Error updating event: ', error);
  }
};


export const saveAvailability = async (eventId: string, availability: { userId: string, displayName: string, date: string, timeSlots: string[] }) => {
  const { userId, displayName, date, timeSlots } = availability;
  const availabilityRef = collection(db, 'events', eventId, 'userAvailabilities');
  const q = query(availabilityRef, where('userId', '==', userId), where('date', '==', date));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const existingDoc = querySnapshot.docs[0];
    await updateDoc(existingDoc.ref, { timeSlots });
    return existingDoc.id;
  } else {
    const docRef = await addDoc(availabilityRef, {
      userId,
      displayName,
      date,
      timeSlots,
    });
    return docRef.id;
  }
};

//can be used to obtain event ('events) or chat ('groups') data
export const getEventData = async (collectionName: string, id: string) => {
  const eventRef = doc(db, collectionName, id);
  const docSnap = await getDoc(eventRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error('Event does not exist');
  }
};

export const getUserAvailability = async (eventId: string, userId: string) => {
  const availabilityRef = collection(db, 'events', eventId, 'userAvailabilities');
  const q = query(availabilityRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  const userAvailability: { [key: string]: string[] } = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    userAvailability[data.date] = data.timeSlots;
  });

  return userAvailability;
};

export const getUserEvents = (userId: string, callback: (events: any[]) => void) => {
  const eventsRef = collection(db, 'events');

  const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
    const allEvents: any[] = [];

    snapshot.forEach(doc => {
      allEvents.push({ id: doc.id, ...doc.data() });
    });

    // Filter events where user is a participant or creator
    const userEvents = allEvents.filter(event =>
      event.creator === userId ||
      event.participants.some((participant: any) => participant.userId === userId)
    );

    callback(userEvents);
  });

  return unsubscribe;
};

export const deleteJioGroup = async (eventId: string) => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    return null;
  }

  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
    alert('Jio Group deleted');
  } catch (error) {
    console.error('Error deleting Jio Group: ', error);
  }
};

export const handleReminderFrequencyChange = async (eventId: string, reminderFrequency: number) => {
  const eventRef = doc(db, 'events', eventId);
  await updateDoc(eventRef, { reminderFrequency });
  alert('Reminder frequency updated');
}

export const getReminderFrequency = async (eventId: string) => {
  const eventRef = doc(db, 'events', eventId);
  const docSnap = await getDoc(eventRef);
  if (!docSnap.exists()) {
    throw new Error('Event does not exist');
  }
  const eventData = docSnap.data();
  return eventData.reminderFrequency;
}


export const sendJioReminders = async () => {
  const user = firebaseAuth.currentUser;
  if (!user) {
    alert('User not logged in');
    return;
  }

  const userId = user.uid;

  getUserEvents(userId, async (events) => {
    if (events.length === 0) {
      console.log('No events found');
      return;
    }

    const today = new Date();
    let reminders = [];

    for (const eventData of events) {
      console.log('Event Data:', eventData);

      if (!eventData.confirmedJioDates || !eventData.reminderFrequency) {
        console.log('Missing confirmedJioDates or reminderFrequency in event:', eventData.name);
        continue;
      }

      const lastConfirmedJioDate = eventData.confirmedJioDates[eventData.confirmedJioDates.length - 1];
      const lastConfirmedJioDateObj = new Date(lastConfirmedJioDate);

      const reminderFrequency = eventData.reminderFrequency;
      const nextReminderDate = addDays(lastConfirmedJioDateObj, reminderFrequency);

      if (today >= nextReminderDate) {
        reminders.push(eventData.name);
      }
    }

    if (reminders.length > 0) {
      const remindersKey = `reminders_${userId}`;
      const storedReminders = await AsyncStorage.getItem(remindersKey);

      const alertWithCustomButtons = (reminders: string, remindersKey: string) => {
        Alert.alert(
          'You have not spent quality time with these friends:',
          reminders,
          [
            {
              text: 'Remind me again',
            },
            {
              text: 'Dismiss',
              onPress: async () => {
                await AsyncStorage.setItem(remindersKey, 'dismissed');
              },
              style: 'cancel',
            },
          ],
          { cancelable: false }
        );
      };
      
      if (!storedReminders) {
        //show meetup reminder for the first time
        alertWithCustomButtons(reminders.join(', '), remindersKey);
      }
    } else {
      console.log('No reminders to send today');
    }
  });
};