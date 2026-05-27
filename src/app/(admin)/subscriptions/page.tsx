import { redirect } from 'next/navigation';

export default function LegacySubscriptionsRedirect() {
  redirect('/super-admin/subscriptions');
}
