import React, { useEffect } from 'react';
import { View } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '@/lib/query-client';
import { NAV_THEME, useAppTheme } from '@/lib/theme';
import { DatabaseProvider } from './database-provider';

import { GlobalModals } from '@/components/core/global-modals';

function ThemedShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, isDark, colors } = useAppTheme();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);

  return (
    <ThemeProvider value={NAV_THEME[resolvedTheme]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {children}
        <GlobalModals />
        <PortalHost />
      </View>
    </ThemeProvider>
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <DatabaseProvider>
              <ThemedShell>{children}</ThemedShell>
            </DatabaseProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
