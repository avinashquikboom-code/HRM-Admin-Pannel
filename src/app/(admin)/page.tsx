import { redirect } from 'next/navigation';
import { PLATFORM_HOME } from '@/lib/portals';

export default function AdminHomePage() {
  redirect(PLATFORM_HOME);
}
