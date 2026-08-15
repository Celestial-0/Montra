import { Progress } from '@/components/ui/progress';

export function BudgetProgressBar({ percentage }: { percentage: number }) {
  return <Progress value={percentage} />;
}
