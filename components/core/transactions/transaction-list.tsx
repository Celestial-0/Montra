import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { useQueryClient } from '@tanstack/react-query';
import { Filter, Plus, Receipt, Search, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TransactionType } from '@/domain/transactions';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useDeleteTransaction, useTransactions } from '@/hooks/use-transactions';
import { QUERY_KEYS } from '@/lib/constants';
import { formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';
import { TransactionCard } from './transaction-card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme';

type QuickTypeFilter = 'all' | 'expense' | 'income' | 'transfer';

export function TransactionList() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const queryClient = useQueryClient();
  const { openAddTransaction, openFilterPanel, filters, hasActiveFilters } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [quickType, setQuickType] = useState<QuickTypeFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: allTransactions = [], isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  const { data: accounts = [] } = useAccounts();
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [String(a.id), a.name])),
    [accounts]
  );
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [String(c.id), c])),
    [categories]
  );

  // Client-side quick filtering (type, search, and store filters)
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Quick type pill
      if (quickType !== 'all') {
        if (quickType === 'transfer' && !tx.isTransfer()) return false;
        if (quickType === 'expense' && tx.type !== 'expense') return false;
        if (quickType === 'income' && tx.type !== 'income') return false;
      }

      // Search query (matches description, category name, or amount)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = (tx.description ?? '').toLowerCase().includes(query);
        const cat = tx.categoryId ? categoryMap.get(String(tx.categoryId)) : null;
        const catMatch = (cat?.name ?? '').toLowerCase().includes(query);
        const amountMatch = String(tx.amount.toMajor()).includes(query);
        if (!descMatch && !catMatch && !amountMatch) return false;
      }

      // Store filters
      if (filters.accountIds.length > 0 && !filters.accountIds.includes(String(tx.accountId))) {
        return false;
      }
      if (
        filters.categoryIds.length > 0 &&
        (!tx.categoryId || !filters.categoryIds.includes(String(tx.categoryId)))
      ) {
        return false;
      }
      if (filters.types.length > 0 && !filters.types.includes(tx.type)) {
        return false;
      }

      return true;
    });
  }, [allTransactions, quickType, searchQuery, filters, categoryMap]);

  // Total matching volume
  const totalMatchingMinor = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => {
      if (tx.isTransfer()) return sum;
      if (tx.type === 'income') return sum + tx.amount.amount;
      return sum - tx.amount.amount;
    }, 0);
  }, [filteredTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('impact');
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.transactions] });
    setRefreshing(false);
  };

  const isFilterActive = hasActiveFilters();

  return (
    <View className="flex-1 bg-background">
      {/* Search & Filter Header */}
      <View
        style={{ paddingTop: Math.max(insets.top + 8, 16) }}
        className="gap-3 border-b border-border bg-card px-4 pb-4"
      >
        {/* Search Bar + Filter Trigger */}
        <View className="flex-row items-center gap-2.5">
          <View className="flex-1 flex-row items-center rounded-xl border border-input bg-background px-3 py-2">
            <Search size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search description, category, amount..."
              placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
              className="ml-2 flex-1 text-sm text-foreground"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <X size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => {
              triggerHaptic('selection');
              openFilterPanel();
            }}
            className={cn(
              'flex-row items-center gap-1.5 rounded-xl border p-2.5 active:bg-accent',
              isFilterActive
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary/50'
            )}
          >
            <Filter
              size={18}
              color={isFilterActive ? colors.income : colors.mutedForeground}
            />
          </Pressable>
        </View>

        {/* Quick Type Filter Pills */}
        <View className="flex-row gap-2">
          {(['all', 'expense', 'income', 'transfer'] as QuickTypeFilter[]).map((t) => {
            const isSelected = quickType === t;
            const labels: Record<QuickTypeFilter, string> = {
              all: 'All',
              expense: 'Expenses',
              income: 'Income',
              transfer: 'Transfers',
            };
            return (
              <Pressable
                key={t}
                onPress={() => {
                  setQuickType(t);
                  triggerHaptic('selection');
                }}
                className={cn(
                  'rounded-full border px-3.5 py-1.5',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-border bg-secondary/60'
                )}
              >
                <Text
                  className={cn(
                    'text-xs font-semibold',
                    isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                >
                  {labels[t]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Results Summary Bar */}
        <View className="flex-row items-center justify-between pt-1">
          <Text className="text-xs font-medium text-muted-foreground">
            {filteredTransactions.length}{' '}
            {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
          </Text>
          <Text className="text-xs font-bold text-foreground">
            Net: {totalMatchingMinor >= 0 ? '+' : ''}
            {formatMoney(totalMatchingMinor)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <Animated.FlatList
        initialNumToRender={10}
        windowSize={5}
        itemLayoutAnimation={LinearTransition}
        data={filteredTransactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const accountName = accountMap.get(String(item.accountId));
          const category = item.categoryId ? categoryMap.get(String(item.categoryId)) : null;
          return (
            <Swipeable
              renderRightActions={() => (
                <Pressable
                  onPress={() => {
                    triggerHaptic('impact');
                    deleteMutation.mutateAsync(item.id);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete transaction"
                  className="bg-destructive justify-center items-center w-20 rounded-2xl ml-2"
                >
                  <Trash2 size={24} color="white" />
                </Pressable>
              )}
            >
              <TransactionCard
                transaction={item}
                accountName={accountName}
                categoryName={category?.name}
                categoryColor={category?.color}
                onPress={() => openAddTransaction(String(item.id))}
              />
            </Swipeable>
          );
        }}
        contentContainerClassName="gap-2.5 p-4 pb-28"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          isLoading ? (
            <View className="gap-3 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} className="h-20 w-full rounded-2xl bg-muted/40" />
              ))}
            </View>
          ) : (
            <View className="w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 mt-4">
              <View className="rounded-full bg-primary/10 p-3">
                <Receipt size={24} color={colors.primary} />
              </View>
              <Text className="mt-3 text-base font-semibold text-foreground text-center">No Transactions</Text>
              <Text className="mt-1 text-center text-xs text-muted-foreground px-4">
                {searchQuery || quickType !== 'all' || isFilterActive
                  ? 'Try adjusting your filters or search keywords.'
                  : 'Start tracking by creating your first transaction.'}
              </Text>
              <Button
                onPress={() => {
                  triggerHaptic('impact');
                  openAddTransaction();
                }}
                className="mt-4 flex-row items-center gap-1.5 px-4"
              >
                <Plus size={16} color={colors.primaryForeground} />
                <Text className="font-semibold text-primary-foreground">Add Transaction</Text>
              </Button>
            </View>
          )
        }
      />
    </View>
  );
}
