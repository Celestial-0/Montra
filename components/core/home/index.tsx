import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Text } from '@/components/ui/text';
import { QUERY_KEYS } from '@/lib/constants';
import { triggerHaptic } from '@/lib/haptics';
import { BudgetPulseCard } from './budget-pulse-card';
import { QuickActionBar } from './quick-action-bar';
import { RecentActivityFeed } from './recent-activity-feed';
import { SpendingHeroDonut } from './spending-hero-donut';

export function HomeDashboard() {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('impact');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] }),
    ]);
    setRefreshing(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top + 8, 20),
        paddingBottom: 100,
      }}
      contentContainerClassName="gap-5 px-4"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Montra Brand Header */}
      <View className="flex-row items-center justify-between pt-1">
        <BrandLogo size={26} showWordmark={true} />
        <View className="rounded-full bg-secondary/80 px-2.5 py-1 border border-border/60">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Local Ledger
          </Text>
        </View>
      </View>

      {/* Spending Breakdown Hero Donut */}
      <SpendingHeroDonut />

      {/* Quick Action Bar */}
      <QuickActionBar />

      {/* Budget Pulse */}
      <BudgetPulseCard />

      {/* Recent Activity Feed */}
      <RecentActivityFeed />
    </ScrollView>
  );
}
