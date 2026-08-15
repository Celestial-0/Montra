import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function ColumnMapper() {
  return (
    <View className="gap-4 p-4">
      <Text className="font-semibold text-foreground">Map CSV Columns</Text>
      <Text className="text-muted-foreground text-xs">Assign file columns to Date, Narration, and Amount</Text>
    </View>
  );
}
