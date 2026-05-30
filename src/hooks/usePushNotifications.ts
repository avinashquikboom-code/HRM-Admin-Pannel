import { useEffect } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import { api } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';

export function usePushNotifications() {
  const { token, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const activeMessaging = messaging;
    if (!activeMessaging) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Replace with your actual VAPID key from Firebase Console
          // Project Settings > Cloud Messaging > Web configuration
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          
          if (!vapidKey) {
            console.warn('VAPID key not set. Cannot request FCM token.');
            return;
          }
          
          const currentToken = await getToken(activeMessaging, { vapidKey });
          
          if (currentToken) {
            // Send token to backend
            await api.post('/api/auth/fcm-token', { token: currentToken });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('An error occurred while retrieving token:', error);
      }
    };

    requestPermission();

    // Listen for foreground messages
    const unsubscribe = onMessage(activeMessaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      // Optional: You can use a toast notification library to show foreground notifications
      if (payload.notification) {
        // new Notification(payload.notification.title || 'New Message', {
        //   body: payload.notification.body,
        // });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [token, user]);
}
