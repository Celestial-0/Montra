import { useLocalSearchParams } from 'expo-router';
import { AccountDetailView } from '@/components/core/accounts/account-detail-view';

export default function AccountDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AccountDetailView accountId={id} />;
}
