import { ErrorBoundaryProps, Link, Stack, router } from 'expo-router';
import { View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Stack.Screen options={{ title: 'Error', headerShown: false }} />
      <View className="items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 p-6 mb-8 w-full max-w-sm">
        <View className="rounded-full bg-destructive/20 p-4 mb-4">
          <AlertCircle size={32} className="text-destructive" />
        </View>
        <Text className="text-xl font-bold text-foreground text-center mb-2">Something went wrong</Text>
        <Text className="text-sm text-muted-foreground text-center mb-6">{error.message}</Text>
        
        <View className="flex-row gap-3 w-full">
          <Button onPress={retry} className="flex-1 bg-destructive">
            <Text className="text-destructive-foreground font-semibold">Try Again</Text>
          </Button>
          <Button variant="outline" onPress={() => router.replace('/(tabs)/home' as any)} className="flex-1">
            <Text className="text-foreground font-semibold">Go Home</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
