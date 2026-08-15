import '@/global.css';

import { Stack } from 'expo-router';
import { AppProvider } from '@/providers/app-provider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  return (
    <AppProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </AppProvider>
  );
}
