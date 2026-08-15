import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
  Receipt,
} from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useTransactions } from '@/hooks/use-transactions';
import { formatDateShort, formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';
import { useUIStore } from '@/stores/ui-store';

export function RecentActivityFeed() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { openAddTransaction } = useUIStore();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: accounts = [] } = useAccounts();
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];

  const accountMap = new Map(accounts.map((a) => [String(a.id), a.name]));
  const categoryMap = new Map(categories.map((c) => [String(c.id), c]));

  const recentTransactions = transactions.slice(0, 6);

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardContent className="gap-3 p-5">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-primary/10 p-1.5">
              <Receipt size={14} color={colors.primary} />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Activity
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/transactions' as any)}
            className="flex-row items-center gap-1 active:opacity-70"
          >
            <Text className="text-xs font-semibold text-primary">View All</Text>
            <ChevronRight size={14} color={colors.primary} />
          </Pressable>
        </View>

        {/* Loading Skeleton */}
        {isLoading ? (
          <View className="gap-2.5">
            {[1, 2, 3].map((key) => (
              <View
                key={key}
                className="flex-row items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3"
              >
                <View className="flex-row items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <View className="gap-1.5">
                    <Skeleton className="h-3.5 w-28 rounded-md" />
                    <Skeleton className="h-2.5 w-20 rounded-md" />
                  </View>
                </View>
                <Skeleton className="h-4 w-16 rounded-md" />
              </View>
            ))}
          </View>
        ) : recentTransactions.length === 0 ? (
          <View className="items-center justify-center py-6">
            <Text className="text-sm text-muted-foreground">No recent transactions.</Text>
            <Pressable
              onPress={() => {
                triggerHaptic('impact');
                openAddTransaction();
              }}
              className="mt-2.5 rounded-lg bg-secondary px-3 py-1.5 active:bg-accent"
            >
              <Text className="text-xs font-medium text-foreground">+ Record First Expense</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-2.5">
            {recentTransactions.map((tx) => {
              const accountName = accountMap.get(String(tx.accountId)) ?? 'Account';
              const category = tx.categoryId ? categoryMap.get(String(tx.categoryId)) : null;
              const isTransfer = tx.isTransfer();
              const isIncome = tx.type === 'income';

              return (
                <Pressable
                  key={String(tx.id)}
                  onPress={() => {
                    triggerHaptic('selection');
                    openAddTransaction(String(tx.id));
                  }}
                  className="flex-row items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 active:bg-accent"
                >
                  {/* Left: Icon & Description */}
                  <View className="flex-1 flex-row items-center gap-3 pr-2">
                    <View
                      className={`h-9 w-9 items-center justify-center rounded-xl ${
                        isTransfer
                          ? 'bg-transfer-muted/50'
                          : isIncome
                          ? 'bg-income-muted/40'
                          : 'bg-destructive/15'
                      }`}
                    >
                      {isTransfer ? (
                        <ArrowLeftRight size={16} color={colors.transfer} />
                      ) : isIncome ? (
                        <ArrowDownLeft size={16} color={colors.income} />
                      ) : (
                        <ArrowUpRight size={16} color={colors.destructive} />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                        {tx.description || (category ? category.name : 'Uncategorized')}
                      </Text>
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[11px] text-muted-foreground">{accountName}</Text>
                        <Text className="text-[11px] text-muted-foreground">•</Text>
                        <Text className="text-[11px] text-muted-foreground">
                          {formatDateShort(tx.occurredAt)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Right: Amount */}
                  <View className="items-end">
                    <Text
                      className={`text-sm font-bold ${
                        isTransfer
                          ? 'text-foreground'
                          : isIncome
                          ? 'text-income'
                          : 'text-destructive'
                      }`}
                    >
                      {isTransfer ? '' : isIncome ? '+' : '-'}
                      {formatMoney(tx.amount.amount, tx.amount.currency)}
                    </Text>
                    {category && (
                      <View className="mt-0.5 rounded px-1.5 py-0.5 bg-secondary">
                        <Text className="text-[10px] text-muted-foreground">{category.name}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </CardContent>
    </Card>
  );
}
