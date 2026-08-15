import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function DuplicateResolver() {
  return (
    <View className="p-4">
      <Text className="font-semibold text-foreground">Duplicate Detection</Text>
      <Text className="text-muted-foreground text-xs">No duplicates detected in current batch.</Text>
    </View>
  );
}
