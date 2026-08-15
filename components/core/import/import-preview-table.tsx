import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export function ImportPreviewTable() {
  return (
    <View className="p-4">
      <Text className="font-semibold text-foreground">Parsed Records Preview</Text>
      <Text className="text-muted-foreground text-xs">Review before committing to local ledger</Text>
    </View>
  );
}
