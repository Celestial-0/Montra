import { View } from 'react-native';
import { CategoryList } from './category-list';

export function CategoriesScreen() {
  return (
    <View className="flex-1 bg-background">
      <CategoryList />
    </View>
  );
}
