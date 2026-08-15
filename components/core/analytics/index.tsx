import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns';
import { ArrowLeft, BarChart3, Calendar, Sparkles } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { QUERY_KEYS } from '@/lib/constants';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { CashFlowBarChart } from './cash-flow-bar-chart';
import { CategoryTrendChart } from './category-trend-chart';
import { SpendingDonutChart } from './spending-donut-chart';

type DateRangeOption = 'this_month' | 'last_30_days' | 'last_90_days' | 'all';

export function AnalyticsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rangeOption, setRangeOption] = useState<DateRangeOption>('this_month');
  const [refreshing, setRefreshing] = useState(false);

  // Compute ISO date range based on selected option
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    switch (rangeOption) {
      case 'this_month':
        return {
          startDate: startOfMonth(now).toISOString(),
          endDate: endOfMonth(now).toISOString(),
        };
      case 'last_30_days':
        return {
          startDate: subDays(now, 30).toISOString(),
          endDate: now.toISOString(),
        };
      case 'last_90_days':
        return {
          startDate: subDays(now, 90).toISOString(),
          endDate: now.toISOString(),
        };
      case 'all':
      default:
        return {
          startDate: undefined,
          endDate: undefined,
        };
    }
  }, [rangeOption]);

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('impact');
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.analytics] });
    setRefreshing(false);
  };

  const rangeButtons: { id: DateRangeOption; label: string }[] = [
    { id: 'this_month', label: 'This Month' },
    { id: 'last_30_days', label: 'Last 30D' },
    { id: 'last_90_days', label: 'Last 90D' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-5 p-4 pb-28"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between pt-1">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 active:bg-accent"
        >
          <ArrowLeft size={16} className="text-foreground" />
          <Text className="text-xs font-semibold text-foreground">Back</Text>
        </Pressable>
        <View className="flex-row items-center gap-1.5 rounded-full border border-border/80 bg-secondary/60 px-3 py-1">
          <BarChart3 size={12} className="text-primary" />
          <Text className="text-[11px] font-semibold text-foreground">Analytics</Text>
        </View>
      </View>

      <View>
        <Text className="text-2xl font-extrabold tracking-tight text-foreground">
          Financial Intelligence
        </Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          Derived analytics, spending distributions, and cash flow velocity.
        </Text>
      </View>

      {/* Date Range Selector Pills */}
      <View className="flex-row gap-2">
        {rangeButtons.map((btn) => {
          const isSelected = rangeOption === btn.id;
          return (
            <Pressable
              key={btn.id}
              onPress={() => {
                setRangeOption(btn.id);
                triggerHaptic('selection');
              }}
              className={cn(
                'flex-1 items-center justify-center rounded-xl border py-2',
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-card active:bg-secondary'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-semibold',
                  isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                {btn.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Cash Flow Dynamics Bar Chart */}
      <CashFlowBarChart startDate={startDate} endDate={endDate} />

      {/* Spending Breakdown Donut Chart */}
      <SpendingDonutChart startDate={startDate} endDate={endDate} />

      {/* Daily Spending Velocity */}
      <CategoryTrendChart startDate={startDate} endDate={endDate} />
    </ScrollView>
  );
}
