import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../FirebaseConfig';

export const getLikedPlaces = (userId: any, callback: any) => {
  const likedPlacesRef = collection(db, 'users', userId, 'likedPlaces');
  return onSnapshot(likedPlacesRef, (snapshot) => {
    const likedPlaces = snapshot.docs.map((doc) => doc.data());
    callback(likedPlaces);
  });
};

export const saveLikedPlace = async (userId: any, place: any) => {
  try {
    const likedPlaceRef = doc(db, 'users', userId, 'likedPlaces', place.place_id);
    await setDoc(likedPlaceRef, place);
  } catch (error) {
    console.error("Error saving liked place: ", error);
  }
};

export const removeLikedPlace = async (userId: any, placeId: any) => {
  try {
    const likedPlaceRef = doc(db, 'users', userId, 'likedPlaces', placeId);
    await deleteDoc(likedPlaceRef);
  } catch (error) {
    console.error("Error removing liked place: ", error);
  }
};

export const fetchLikedList = (userId: any, callback: any) => {
  const likedCollectionRef = collection(db, `users/${userId}/likedPlaces`);
  const q = query(likedCollectionRef);

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const likedList = snapshot.docs.map((doc) => ({ 
      id: doc.id,
      name: doc.data().name, // Assuming 'name' is also a field in your documents
      address: doc.data().formatted_address, // Update to 'formatted_address'
    }));
    callback(likedList);
  });

  return unsubscribe;
};
