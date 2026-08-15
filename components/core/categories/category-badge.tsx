import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

export function CategoryBadge({ name, color }: { name: string; color?: string }) {
  return (
    <Badge variant="outline">
      <Text className="text-xs">{name}</Text>
    </Badge>
  );
}
