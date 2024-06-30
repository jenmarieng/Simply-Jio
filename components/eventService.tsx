import { db, firebaseAuth } from '../FirebaseConfig';
import { collection, addDoc, getDocs, query, doc, getDoc, where, updateDoc, arrayUnion, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getUsername } from '../components/userService';

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
  //const username = await getUsername(user.uid); 
  const docRef = await addDoc(collection(db, 'events'), {
    name,
    creator: [{ userId: user.uid, displayName: user.displayName, email: user.email }],
    participants: [{ userId: user.uid, displayName: user.displayName, email: user.email }],
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
  //const username = await getUsername(user.uid); 
  if (!existingParticipant) {
    if (!user.displayName) {
      alert('Please set a display name first!');
      return null;
    }
    await updateDoc(eventRef, {
      participants: arrayUnion({ userId: user.uid, displayName: user.displayName, email: user.email }),
    });
  }
  return docSnap.data();
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

export const getEventData = async (eventId: string) => {
  const eventRef = doc(db, 'events', eventId);
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
