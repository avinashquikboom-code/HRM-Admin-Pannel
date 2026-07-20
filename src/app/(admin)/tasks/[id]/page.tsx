import TaskDetailPage from '@/features/tasks/pages/TaskDetailPage';

interface Props {
  params: { id: string };
}

export default function TaskDetailPageWrapper({ params }: Props) {
  return <TaskDetailPage taskId={params.id} />;
}
