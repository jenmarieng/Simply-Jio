// Import the functions you need from the SDKs you need
import { initializeApp } from '@firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeAuth, getReactNativePersistence } from '@firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPlx1EOT4kjEcebtmH-YbCui3kpFgHOc0",
  authDomain: "simplyjio.firebaseapp.com",
  databaseURL: "https://simplyjio-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "simplyjio",
  storageBucket: "simplyjio.appspot.com",
  messagingSenderId: "627931294052",
  appId: "1:627931294052:web:7bee75760eefde08dcf271",
  measurementId: "G-HGKC7D50Q5"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});