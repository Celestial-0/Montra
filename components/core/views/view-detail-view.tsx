import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, Trash2 } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useDeleteView, useViewResults } from '@/hooks/use-views';
import { formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useUIStore } from '@/stores/ui-store';
import { TransactionCard } from '../transactions/transaction-card';

export function ViewDetailView({ viewId }: { viewId: string }) {
  const router = useRouter();
  const { openAddTransaction } = useUIStore();
  const { data: viewResult, isLoading } = useViewResults(viewId);
  const deleteView = useDeleteView();

  const { data: accounts = [] } = useAccounts();
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];

  const accountMap = new Map(accounts.map((a) => [String(a.id), a.name]));
  const categoryMap = new Map(categories.map((c) => [String(c.id), c]));

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!viewResult) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-base font-semibold text-foreground">View Not Found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-secondary px-4 py-2">
          <Text className="text-xs font-semibold text-foreground">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const { view, transactions, totalAmountMinor } = viewResult;

  const handleDelete = async () => {
    try {
      await deleteView.mutateAsync(viewId);
      triggerHaptic('impact');
      router.back();
    } catch {
      // Ignored
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="gap-3 border-b border-border bg-card p-4">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 active:bg-accent"
          >
            <ArrowLeft size={16} className="text-foreground" />
            <Text className="text-xs font-semibold text-foreground">Back</Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            className="rounded-xl bg-destructive/15 p-2 active:bg-destructive/30"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete view"
          >
            <Trash2 size={16} color="#ef4444" />
          </Pressable>
        </View>

        <View>
          <Text className="text-2xl font-extrabold tracking-tight text-foreground">
            {view.name}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {transactions.length} matching {transactions.length === 1 ? 'record' : 'records'} • Total volume: {formatMoney(totalAmountMinor)}
          </Text>
        </View>
      </View>

      {/* Transaction Results List */}
      <FlatList
        initialNumToRender={10}
        windowSize={5}
        data={transactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const accountName = accountMap.get(String(item.accountId));
          const category = item.categoryId ? categoryMap.get(String(item.categoryId)) : null;
          return (
            <TransactionCard
              transaction={item}
              accountName={accountName}
              categoryName={category?.name}
              categoryColor={category?.color}
              onPress={() => openAddTransaction(String(item.id))}
            />
          );
        }}
        contentContainerClassName="gap-2.5 p-4 pb-28"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Text className="text-sm text-muted-foreground">
              No transactions match the criteria for this saved view.
            </Text>
          </View>
        }
      />
    </View>
  );
}
