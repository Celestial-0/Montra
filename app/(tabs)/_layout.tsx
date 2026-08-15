import React from 'react';
import { Tabs } from 'expo-router';
import { GlassFloatingTabBar } from '@/components/ui/glass-tab-bar';
import { useAppTheme } from '@/lib/theme';

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <GlassFloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
        }}
      />
    </Tabs>
  );
}
