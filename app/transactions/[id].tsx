import { useLocalSearchParams } from 'expo-router';
import { TransactionDetailView } from '@/components/core/transactions/transaction-detail-view';

export default function TransactionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TransactionDetailView transactionId={id} />;
}
