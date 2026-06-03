import { initializeApp, getApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAmZAV3atCPIIWcVlzQ4wlJf1IlAdaU1JM",
  authDomain: "quickboom-notification.firebaseapp.com",
  projectId: "quickboom-notification",
  storageBucket: "quickboom-notification.firebasestorage.app",
  messagingSenderId: "49476481566",
  appId: "1:49476481566:web:96afd00ce63071a1df340f"
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
