import { useLocalSearchParams } from 'expo-router';
import { BudgetDetailView } from '@/components/core/budgets/budget-detail-view';

export default function BudgetDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BudgetDetailView budgetId={id} />;
}
