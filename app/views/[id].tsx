import { useLocalSearchParams } from 'expo-router';
import { ViewDetailView } from '@/components/core/views/view-detail-view';

export default function ViewRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ViewDetailView viewId={id} />;
}
