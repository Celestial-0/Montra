import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, CheckCircle2, Edit3, PieChart, Trash2 } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { useBudgetProgress, useDeleteBudget } from '@/hooks/use-budgets';
import { formatMoney, formatPercentage } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useUIStore } from '@/stores/ui-store';

export function BudgetDetailView({ budgetId }: { budgetId: string }) {
  const router = useRouter();
  const { openAddBudget } = useUIStore();
  const { data: budgetProgressList = [], isLoading } = useBudgetProgress();
  const deleteMutation = useDeleteBudget();

  const progress = budgetProgressList.find((p) => String(p.budget.id) === budgetId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!progress) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-base font-semibold text-foreground">Budget Not Found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-secondary px-4 py-2">
          <Text className="text-xs font-semibold text-foreground">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const { budget, spentAmount, remainingAmount, percentageUsed, isExceeded, isWarning } = progress;
  const isOver = isExceeded;
  const progressValue = Math.min(percentageUsed, 100);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(budgetId);
      triggerHaptic('impact');
      router.back();
    } catch {
      // Ignored
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-5 p-4 pb-28"
      showsVerticalScrollIndicator={false}
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

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => {
              triggerHaptic('selection');
              openAddBudget(budgetId);
            }}
            className="rounded-xl bg-secondary p-2 active:bg-accent"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit budget"
          >
            <Edit3 size={18} className="text-foreground" />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            className="rounded-xl bg-destructive/15 p-2 active:bg-destructive/30"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete budget"
          >
            <Trash2 size={18} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      {/* Main Budget Card */}
      <Card className="rounded-2xl border-border bg-card shadow-sm p-6 gap-4">
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-primary/10 p-3">
            <PieChart size={24} className="text-primary" />
          </View>
          <View className="flex-row items-center gap-1.5">
            {isOver ? (
              <View className="flex-row items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-0.5 border border-destructive/30">
                <AlertCircle size={12} color="#ef4444" />
                <Text className="text-xs font-bold text-destructive">Exceeded</Text>
              </View>
            ) : isWarning ? (
              <View className="flex-row items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 border border-amber-500/30">
                <AlertCircle size={12} color="#f59e0b" />
                <Text className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {formatPercentage(percentageUsed)}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1 rounded-full bg-income-muted/40 px-2.5 py-0.5 border border-income/30">
                <CheckCircle2 size={12} color="#22c55e" />
                <Text className="text-xs font-bold text-income">On Track</Text>
              </View>
            )}
          </View>
        </View>

        <View>
          <Text className="text-2xl font-extrabold text-foreground">{budget.name}</Text>
          <Text className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
            {budget.period.cadence} • Scope: {budget.scope.type}
          </Text>
        </View>

        {/* Spent vs Remaining */}
        <View className="flex-row items-baseline justify-between border-t border-border/50 pt-3">
          <View>
            <Text className="text-xs text-muted-foreground">Spent this Period</Text>
            <Text className="text-xl font-bold text-foreground">
              {formatMoney(spentAmount.amount, budget.targetAmount.currency)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted-foreground">Spending Target</Text>
            <Text className="text-xl font-bold text-foreground">
              {formatMoney(budget.targetAmount.amount, budget.targetAmount.currency)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="gap-1.5">
          <Progress
            value={progressValue}
            className={`h-3 rounded-full ${
              isOver
                ? 'bg-destructive/20'
                : isWarning
                ? 'bg-amber-500/20'
                : 'bg-secondary'
            }`}
          />
          <Text className="text-right text-xs font-semibold text-muted-foreground">
            {formatPercentage(percentageUsed)} Used
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
