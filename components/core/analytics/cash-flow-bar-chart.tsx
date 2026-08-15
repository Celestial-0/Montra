import React from 'react';
import { View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useCashFlow } from '@/hooks/use-analytics';
import { formatMoney, formatPercentage } from '@/lib/format';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';

export interface CashFlowBarChartProps {
  startDate?: string;
  endDate?: string;
}

export function CashFlowBarChart({ startDate, endDate }: CashFlowBarChartProps) {
  const { isDark } = useAppTheme();
  const { data: cashFlow } = useCashFlow(startDate, endDate);

  const totalIncomeMinor = cashFlow?.totalIncomeMinor ?? 0;
  const totalExpenseMinor = cashFlow?.totalExpenseMinor ?? 0;
  const netFlowMinor = cashFlow?.netFlowMinor ?? 0;
  const isPositive = netFlowMinor >= 0;

  const maxVolume = Math.max(totalIncomeMinor, totalExpenseMinor, 1);
  const incomeHeightPercent = Math.round((totalIncomeMinor / maxVolume) * 100);
  const expenseHeightPercent = Math.round((totalExpenseMinor / maxVolume) * 100);

  const savingsRate =
    totalIncomeMinor > 0
      ? Math.max(0, Math.round(((totalIncomeMinor - totalExpenseMinor) / totalIncomeMinor) * 100))
      : 0;

  const incomeColor = parseOklch(isDark ? 'oklch(0.72 0.20 148)' : 'oklch(0.62 0.19 148)');
  const expenseColor = parseOklch(isDark ? 'oklch(0.68 0.21 25)' : 'oklch(0.60 0.22 25)');

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Cash Flow Dynamics
        </CardTitle>
        <View className="flex-row items-center gap-1">
          {isPositive ? (
            <TrendingUp size={14} color={incomeColor} />
          ) : (
            <TrendingDown size={14} color={expenseColor} />
          )}
          <Text
            className={`text-xs font-bold ${
              isPositive ? 'text-income' : 'text-destructive'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatMoney(netFlowMinor)} Net
          </Text>
        </View>
      </CardHeader>

      <CardContent className="gap-5 p-5">
        {/* Visual Bar Comparison Columns */}
        <View className="h-40 flex-row items-end justify-around rounded-xl bg-secondary/40 px-6 py-4 border border-border/50">
          {/* Income Column */}
          <View className="w-24 items-center gap-2">
            <Text className="text-[11px] font-bold text-income" numberOfLines={1}>
              {formatMoney(totalIncomeMinor)}
            </Text>
            <View className="w-full h-24 justify-end items-center">
              <View
                style={{ height: `${Math.max(incomeHeightPercent, 8)}%` }}
                className="w-full rounded-t-lg bg-income"
              />
            </View>
            <View className="flex-row items-center gap-1">
              <ArrowUpRight size={12} color={incomeColor} />
              <Text className="text-xs font-semibold text-foreground">Income</Text>
            </View>
          </View>

          {/* Expense Column */}
          <View className="w-24 items-center gap-2">
            <Text className="text-[11px] font-bold text-destructive" numberOfLines={1}>
              {formatMoney(totalExpenseMinor)}
            </Text>
            <View className="w-full h-24 justify-end items-center">
              <View
                style={{ height: `${Math.max(expenseHeightPercent, 8)}%` }}
                className="w-full rounded-t-lg bg-destructive"
              />
            </View>
            <View className="flex-row items-center gap-1">
              <ArrowDownLeft size={12} color={expenseColor} />
              <Text className="text-xs font-semibold text-foreground">Expense</Text>
            </View>
          </View>
        </View>

        {/* Metrics Grid */}
        <View className="flex-row gap-3 border-t border-border/60 pt-3">
          <View className="flex-1 rounded-xl bg-secondary/50 p-3">
            <Text className="text-[11px] font-medium text-muted-foreground">Savings Rate</Text>
            <Text className="text-base font-extrabold text-foreground">
              {formatPercentage(savingsRate)}
            </Text>
          </View>

          <View className="flex-1 rounded-xl bg-secondary/50 p-3">
            <Text className="text-[11px] font-medium text-muted-foreground">Cash Position</Text>
            <Text
              className={`text-base font-extrabold ${
                isPositive ? 'text-income' : 'text-destructive'
              }`}
            >
              {isPositive ? 'Surplus' : 'Deficit'}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
