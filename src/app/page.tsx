import { redirect } from 'next/navigation';
import { PLATFORM_LOGIN_PATH } from '@/lib/portals';

export default function RootPage() {
  redirect(PLATFORM_LOGIN_PATH);
}
