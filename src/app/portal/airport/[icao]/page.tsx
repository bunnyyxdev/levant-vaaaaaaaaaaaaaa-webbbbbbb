import AirportDetail from '@/components/AirportDetail';

interface PageProps {
    params: { icao: string };
}

export default function AirportPage({ params }: PageProps) {
    return <AirportDetail icao={params.icao} />;
}
