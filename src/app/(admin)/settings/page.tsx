import { redirect } from 'next/navigation';

export default function LegacySettingsRedirect() {
  redirect('/super-admin/settings');
}
