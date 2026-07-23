import TaskDetailPage from '@/features/tasks/pages/TaskDetailPage';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPageWrapper({ params }: Props) {
  const resolvedParams = await params;
  return <TaskDetailPage taskId={resolvedParams.id} />;
}
