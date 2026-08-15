import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle, CheckCircle2, ChevronRight, PieChart, Plus } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useBudgetProgress } from '@/hooks/use-budgets';
import { formatMoney, formatPercentage } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';
import { useUIStore } from '@/stores/ui-store';

export function BudgetPulseCard() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { openAddBudget } = useUIStore();
  const { data: budgetProgressList = [], isLoading } = useBudgetProgress();

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border bg-card p-4 shadow-sm">
        <View className="gap-2.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </View>
            <Skeleton className="h-4 w-16 rounded-md" />
          </View>
          <Skeleton className="h-2.5 w-full rounded-full" />
          <View className="flex-row items-center justify-between">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </View>
        </View>
      </Card>
    );
  }

  if (budgetProgressList.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-border bg-card/60 p-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 min-w-0 flex-row items-center gap-3">
            <View className="rounded-xl bg-secondary/80 p-2.5 shrink-0">
              <PieChart size={18} color={colors.primary} />
            </View>
            <View className="flex-1 min-w-0">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                No Active Budgets
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                Set spending targets to stay on track.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              triggerHaptic('selection');
              openAddBudget();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add budget"
            className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary active:opacity-80 shadow-sm"
          >
            <Plus size={16} color={colors.primaryForeground} />
          </Pressable>
        </View>
      </Card>
    );
  }

  // Find most critical budget (highest percentage or exceeded)
  const sorted = [...budgetProgressList].sort((a, b) => b.percentageUsed - a.percentageUsed);
  const primaryBudget = sorted[0];

  const { budget, spentAmount, remainingAmount, percentageUsed, isExceeded, isWarning } =
    primaryBudget;

  const progressColor = isExceeded
    ? colors.destructive
    : isWarning
    ? colors.warning
    : colors.income;

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardContent className="gap-3 p-5">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            {isExceeded ? (
              <AlertCircle size={15} color={colors.destructive} />
            ) : (
              <CheckCircle2 size={15} color={progressColor} />
            )}
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Budget Pulse
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/budgets' as any)}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Text className="text-xs font-semibold text-primary">All Budgets</Text>
            <ChevronRight size={14} color={colors.primary} />
          </Pressable>
        </View>

        {/* Budget Item */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-foreground">{budget.name}</Text>
            <Text className="text-xs font-bold" style={{ color: progressColor }}>
              {formatPercentage(percentageUsed)}
            </Text>
          </View>

          {/* Progress Bar */}
          <Progress
            value={Math.min(percentageUsed, 100)}
            indicatorClassName={
              isExceeded
                ? 'bg-destructive'
                : isWarning
                ? 'bg-amber-500 dark:bg-amber-400'
                : 'bg-income'
            }
            className="h-2 rounded-full bg-secondary"
          />

          {/* Details Row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">
              Spent: {formatMoney(spentAmount.amount, spentAmount.currency)}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {isExceeded ? 'Over by ' : 'Left: '}
              <Text
                className={`font-semibold ${isExceeded ? 'text-destructive' : 'text-foreground'}`}
              >
                {formatMoney(Math.abs(remainingAmount.amount), remainingAmount.currency)}
              </Text>
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
