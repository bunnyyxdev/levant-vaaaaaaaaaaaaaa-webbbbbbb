import ActivityDetail from '@/components/ActivityDetail';

interface PageProps {
    params: { id: string };
}

export default function ActivityDetailPage({ params }: PageProps) {
    return <ActivityDetail activityId={params.id} />;
}
