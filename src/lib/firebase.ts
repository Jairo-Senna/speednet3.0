import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAJH2S6l3UkeaJx3mDwNdWLwQau7az8R40",
  authDomain: "controle-paloma.firebaseapp.com",
  projectId: "controle-paloma",
  storageBucket: "controle-paloma.firebasestorage.app",
  messagingSenderId: "410740668297",
  appId: "1:410740668297:web:31a58c31fa254bcf7e9358",
  measurementId: "G-GN3KDTH1BX"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Ativa persistência de autenticação no navegador
try {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Persistência local do Firebase Auth falhou:", err);
  });
} catch (e) {
  console.warn("Aviso ao configurar persistência do Firebase Auth:", e);
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
};
export type { User };
