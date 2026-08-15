import React from 'react';
import { View } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAccounts } from '@/hooks/use-accounts';
import { useCashFlow } from '@/hooks/use-analytics';
import { formatMoney } from '@/lib/format';
import { useAppTheme } from '@/lib/theme';

export function NetWorthSummary() {
  const { colors } = useAppTheme();
  const { data: accounts = [] } = useAccounts();
  const { data: cashFlow } = useCashFlow();

  // Sum active accounts balance
  const totalBalanceMinor = accounts.reduce((acc, account) => {
    if (!account.isActive) return acc;
    return acc + account.currentBalance.amount;
  }, 0);

  const totalIncomeMinor = cashFlow?.totalIncomeMinor ?? 0;
  const totalExpenseMinor = cashFlow?.totalExpenseMinor ?? 0;

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardContent className="gap-4 p-5">
        {/* Header Label */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-primary/10 p-1.5">
              <Wallet size={14} color={colors.primary} />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Net Worth
            </Text>
          </View>
          <Text className="text-xs font-medium text-muted-foreground">
            {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </Text>
        </View>

        {/* Main Balance Display */}
        <View>
          <Text className="text-3xl font-extrabold tracking-tight text-foreground">
            {formatMoney(totalBalanceMinor)}
          </Text>
        </View>

        {/* Month-to-Date Cash Flow Sub-Cards */}
        <View className="flex-row gap-3 pt-1">
          {/* Income */}
          <View className="flex-1 flex-row items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/40 p-3">
            <View className="rounded-full bg-income-muted/50 p-2">
              <ArrowUpRight size={14} color={colors.income} />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-muted-foreground">Income MTD</Text>
              <Text className="text-sm font-bold text-income" numberOfLines={1}>
                +{formatMoney(totalIncomeMinor)}
              </Text>
            </View>
          </View>

          {/* Expenses */}
          <View className="flex-1 flex-row items-center gap-2.5 rounded-xl border border-border/70 bg-secondary/40 p-3">
            <View className="rounded-full bg-destructive/15 p-2">
              <ArrowDownLeft size={14} color={colors.destructive} />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-medium text-muted-foreground">Spent MTD</Text>
              <Text className="text-sm font-bold text-destructive" numberOfLines={1}>
                -{formatMoney(totalExpenseMinor)}
              </Text>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
