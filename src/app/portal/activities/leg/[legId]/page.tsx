import ActivityLegDetail from '@/components/ActivityLegDetail';

interface PageProps {
    params: { legId: string };
}

export default function ActivityLegPage({ params }: PageProps) {
    return <ActivityLegDetail legId={params.legId} />;
}
