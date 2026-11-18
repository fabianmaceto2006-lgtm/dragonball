// firebase/config.js
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Proyecto de Firebase: dragonballapi
const firebaseConfig = {
  apiKey: 'AIzaSyDNIhfdyf4polumKXlCZpfoPAM8qXSA-lE',
  authDomain: 'dragonballapi-d4321.firebaseapp.com',
  projectId: 'dragonballapi-d4321',
  storageBucket: 'dragonballapi-d4321.firebasestorage.app',
  messagingSenderId: '624571404205',
  appId: '1:624571404205:web:aa11fcd42aa22a246a9b24',
};

const app = initializeApp(firebaseConfig);

// En el celular la sesión se guarda con AsyncStorage para no pedir
// el login cada vez que abres la app. En el navegador basta getAuth.
export const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);
