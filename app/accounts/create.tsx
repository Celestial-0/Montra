import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUIStore } from '@/stores/ui-store';

export default function CreateAccountModalRoute() {
  const router = useRouter();
  const { openAddAccount } = useUIStore();

  useEffect(() => {
    openAddAccount();
    router.replace('/(tabs)/accounts' as any);
  }, []);

  return <View className="flex-1 bg-background" />;
}
