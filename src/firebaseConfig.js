import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAH2QIVafNU6snmVdj3t4K5rfce645I7hg",
  authDomain: "contaduria-e9942.firebaseapp.com",
  projectId: "contaduria-e9942",
  storageBucket: "contaduria-e9942.firebasestorage.app",
  messagingSenderId: "604044899220",
  appId: "1:604044899220:web:11fc69b26d28e77a46d581"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;