import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export function ViewFilterBuilder() {
  return (
    <View className="gap-2 p-4">
      <Text className="text-sm font-medium">Filter Conditions</Text>
      <Button variant="outline">
        <Text>+ Add Condition</Text>
      </Button>
    </View>
  );
}
