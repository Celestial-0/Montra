import { FlatList, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { DEFAULT_CATEGORIES } from '@/lib/constants';
import { CategoryBadge } from './category-badge';

export function CategoryList() {
  return (
    <FlatList
      data={DEFAULT_CATEGORIES as any}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="flex-row items-center justify-between border-b border-border p-4">
          <Text className="font-medium text-foreground">{item.name}</Text>
          <CategoryBadge name={item.name} color={item.color} />
        </View>
      )}
    />
  );
}
