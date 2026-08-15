import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

export function RolloverBadge({ amount }: { amount?: string }) {
  return (
    <Badge variant="secondary">
      <Text className="text-xs">Rollover: {amount ?? '₹0'}</Text>
    </Badge>
  );
}
