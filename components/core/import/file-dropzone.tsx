import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Upload } from 'lucide-react-native';

export function FileDropzone() {
  return (
    <View className="items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
      <Upload size={32} color="#9ca3af" />
      <Text className="text-muted-foreground mt-2 text-sm">Select CSV or JSON bank statement</Text>
      <Button className="mt-4" size="sm">
        <Text className="text-primary-foreground">Choose File</Text>
      </Button>
    </View>
  );
}
