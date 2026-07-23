import EmployeeDetailPage from '@/features/employees/pages/EmployeeDetailPage';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPageWrapper({ params }: Props) {
  const resolvedParams = await params;
  return <EmployeeDetailPage employeeIntId={resolvedParams.id} />;
}
