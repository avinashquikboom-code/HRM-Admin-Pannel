'use client';

import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationInitializer() {
  usePushNotifications();
  return null;
}
