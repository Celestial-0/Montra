import { View } from 'react-native';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CategoryPicker() {
  return (
    <View className="gap-2">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem label="Food & Dining" value="cat-food" />
          <SelectItem label="Groceries" value="cat-groceries" />
        </SelectContent>
      </Select>
    </View>
  );
}
