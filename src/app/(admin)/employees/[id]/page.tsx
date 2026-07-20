import EmployeeDetailPage from '@/features/employees/pages/EmployeeDetailPage';

interface Props {
  params: { id: string };
}

export default function EmployeeDetailPageWrapper({ params }: Props) {
  return <EmployeeDetailPage employeeIntId={params.id} />;
}
