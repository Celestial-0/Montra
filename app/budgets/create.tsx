import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUIStore } from '@/stores/ui-store';

export default function CreateBudgetModalRoute() {
  const router = useRouter();
  const { openAddBudget } = useUIStore();

  useEffect(() => {
    openAddBudget();
    router.replace('/(tabs)/budget' as any);
  }, []);

  return <View className="flex-1 bg-background" />;
}
