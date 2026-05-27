import { redirect } from 'next/navigation';

export default function LegacyCompaniesRedirect() {
  redirect('/super-admin/companies');
}
