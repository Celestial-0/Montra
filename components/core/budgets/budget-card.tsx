import React from 'react';
import { Pressable, View } from 'react-native';
import { AlertCircle, CheckCircle2, RotateCw } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { BudgetProgress } from '@/domain/budgets';
import { formatMoney, formatPercentage } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';

export interface BudgetCardProps {
  progress: BudgetProgress;
  onPress?: () => void;
}

export const BudgetCard = React.memo(function BudgetCard({ progress, onPress }: BudgetCardProps) {
  const { colors } = useAppTheme();
  const { budget, spentAmount, remainingAmount, percentageUsed, isExceeded, isWarning } = progress;

  const isOver = isExceeded;
  const progressValue = Math.min(percentageUsed, 100);

  return (
    <Pressable
      onPress={() => {
        triggerHaptic('selection');
        onPress?.();
      }}
      className="active:opacity-90"
    >
      <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
        <CardContent className="gap-3.5 p-5">
          {/* Top Row: Scope / Cadence Badges & Status */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <View className="rounded-md bg-secondary px-2 py-0.5 border border-border/60">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {budget.period.cadence}
                </Text>
              </View>
              {budget.rolloverEnabled && (
                <View className="flex-row items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 border border-primary/20">
                  <RotateCw size={10} color={colors.primary} />
                  <Text className="text-[10px] font-semibold text-primary">Rollover</Text>
                </View>
              )}
            </View>

            {/* Status Pill */}
            {isOver ? (
              <View className="flex-row items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 border border-destructive/30">
                <AlertCircle size={12} color={colors.destructive} />
                <Text className="text-xs font-bold text-destructive">
                  +{formatMoney(Math.abs(remainingAmount.amount), budget.targetAmount.currency)} Over
                </Text>
              </View>
            ) : isWarning ? (
              <View className="flex-row items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 border border-amber-500/30">
                <AlertCircle size={12} color={colors.warning} />
                <Text className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {formatPercentage(percentageUsed)}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1 rounded-full bg-income-muted/40 px-2.5 py-0.5 border border-income/30">
                <CheckCircle2 size={12} color={colors.income} />
                <Text className="text-xs font-bold text-income">
                  {formatMoney(remainingAmount.amount, budget.targetAmount.currency)} left
                </Text>
              </View>
            )}
          </View>

          {/* Title & Spent vs Target */}
          <View className="flex-row items-baseline justify-between">
            <Text className="text-base font-bold text-foreground">{budget.name}</Text>
            <Text className="text-sm font-semibold text-foreground">
              {formatMoney(spentAmount.amount, budget.targetAmount.currency)}{' '}
              <Text className="text-xs font-normal text-muted-foreground">
                / {formatMoney(budget.targetAmount.amount, budget.targetAmount.currency)}
              </Text>
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="gap-1">
            <Progress
              value={progressValue}
              className={`h-2.5 rounded-full ${
                isOver
                  ? 'bg-destructive/20'
                  : isWarning
                  ? 'bg-amber-500/20'
                  : 'bg-secondary'
              }`}
            />
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
});
