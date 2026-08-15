import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUIStore } from '@/stores/ui-store';

export default function CreateTransactionModalRoute() {
  const router = useRouter();
  const { openAddTransaction } = useUIStore();

  useEffect(() => {
    openAddTransaction();
    router.replace('/(tabs)/transactions' as any);
  }, []);

  return <View className="flex-1 bg-background" />;
}
