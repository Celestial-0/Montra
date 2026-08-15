import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function BudgetPeriodSelector() {
  return (
    <View className="flex-row gap-2">
      <Button variant="outline" size="sm">
        <Text>Monthly</Text>
      </Button>
      <Button variant="ghost" size="sm">
        <Text>Weekly</Text>
      </Button>
    </View>
  );
}
