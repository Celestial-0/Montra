import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function ViewPicker() {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Button variant="outline" size="sm">
        <Text>All Expenses</Text>
      </Button>
      <Button variant="ghost" size="sm">
        <Text>This Month</Text>
      </Button>
    </View>
  );
}
