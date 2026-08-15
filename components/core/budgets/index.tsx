import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { PieChart, Plus, Sparkles } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useBudgetProgress } from '@/hooks/use-budgets';
import { QUERY_KEYS } from '@/lib/constants';
import { formatMoney, formatPercentage } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useUIStore } from '@/stores/ui-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme';
import { BudgetCard } from './budget-card';

export function BudgetOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const queryClient = useQueryClient();
  const { openAddBudget } = useUIStore();
  const { data: budgetProgressList = [], isLoading } = useBudgetProgress();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('impact');
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.budgets] });
    setRefreshing(false);
  };

  // Aggregate stats across all active budgets
  const totalTargetMinor = budgetProgressList.reduce((acc, p) => acc + p.budget.targetAmount.amount, 0);
  const totalSpentMinor = budgetProgressList.reduce((acc, p) => acc + p.spentAmount.amount, 0);
  const totalRemainingMinor = totalTargetMinor - totalSpentMinor;
  const overallPercentage = totalTargetMinor > 0 ? (totalSpentMinor / totalTargetMinor) * 100 : 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top + 8, 16),
        paddingBottom: 110,
      }}
      contentContainerClassName="gap-5 px-4"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header & New Budget CTA */}
      <View className="flex-row items-center justify-between pt-1">
        <View>
          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Budgets
          </Text>
        </View>
        <Button
          onPress={() => {
            triggerHaptic('impact');
            openAddBudget();
          }}
          className="flex-row items-center gap-1.5 px-3.5 py-2"
        >
          <Plus size={16} color={colors.primaryForeground} />
          <Text className="text-xs font-semibold text-primary-foreground">New Budget</Text>
        </Button>
      </View>

      {/* Aggregate Overview Card (if budgets exist) */}
      {budgetProgressList.length > 0 && (
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="gap-3.5 p-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Budget Utilization
              </Text>
              <Text className="text-xs font-bold text-foreground">
                {formatPercentage(overallPercentage)} Used
              </Text>
            </View>

            <View className="flex-row items-baseline justify-between">
              <Text className="text-2xl font-extrabold text-foreground">
                {formatMoney(totalSpentMinor)}
              </Text>
              <Text className="text-sm font-medium text-muted-foreground">
                of {formatMoney(totalTargetMinor)} allocated
              </Text>
            </View>

            <View className="flex-row items-center justify-between border-t border-border/60 pt-3">
              <Text className="text-xs text-muted-foreground">Remaining Budget Pool</Text>
              <Text
                className={`text-xs font-bold ${
                  totalRemainingMinor < 0 ? 'text-destructive' : 'text-income'
                }`}
              >
                {totalRemainingMinor < 0 ? '-' : '+'}
                {formatMoney(Math.abs(totalRemainingMinor))}
              </Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Active Budgets List */}
      <View className="gap-3">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active Plans ({budgetProgressList.length})
        </Text>

        {isLoading ? (
          <View className="gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-32 w-full rounded-2xl bg-muted/40" />
            ))}
          </View>
        ) : budgetProgressList.length === 0 ? (
          <View className="w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 mt-4">
            <View className="rounded-full bg-primary/10 p-3">
              <PieChart size={24} color={colors.primary} />
            </View>
            <Text className="mt-3 text-base font-semibold text-foreground text-center">No Budgets Configured</Text>
            <Text className="mt-1 text-center text-xs text-muted-foreground px-4">
              Budgets help you constrain and track spending across categories, tags, or overall accounts.
            </Text>
            <Button
              onPress={() => {
                triggerHaptic('impact');
                openAddBudget();
              }}
              className="mt-4 flex-row items-center gap-1.5 px-4"
            >
              <Plus size={16} color={colors.primaryForeground} />
              <Text className="font-semibold text-primary-foreground">Create First Budget</Text>
            </Button>
          </View>
        ) : (
          budgetProgressList.map((progress) => (
            <BudgetCard
              key={String(progress.budget.id)}
              progress={progress}
              onPress={() => openAddBudget(String(progress.budget.id))}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
