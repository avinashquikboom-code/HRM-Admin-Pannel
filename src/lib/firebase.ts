import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBX3g0GGTv7KanU1FAQqJ9oNc6v0NugM9g",
  authDomain: "quickboom-hrm.firebaseapp.com",
  projectId: "quickboom-hrm",
  storageBucket: "quickboom-hrm.firebasestorage.app",
  messagingSenderId: "706418474557",
  appId: "1:706418474557:web:08c4b5be6e1fcc389c7454"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let messaging: ReturnType<typeof getMessaging> | null = null;

// Initialize Messaging only if supported in the browser
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { app, messaging, getToken, onMessage };
