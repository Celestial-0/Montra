import React from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Edit3, Landmark, Trash2 } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAccount, useDeleteAccount } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useTransactions } from '@/hooks/use-transactions';
import { formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useUIStore } from '@/stores/ui-store';
import { TransactionCard } from '../transactions/transaction-card';

export function AccountDetailView({ accountId }: { accountId: string }) {
  const router = useRouter();
  const { openAddAccount, openAddTransaction } = useUIStore();
  const { data: account, isLoading } = useAccount(accountId);
  const { data: allTransactions = [] } = useTransactions({ accountId });
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];
  const categoryMap = new Map(categories.map((c) => [String(c.id), c]));
  const deleteMutation = useDeleteAccount();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!account) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-base font-semibold text-foreground">Account Not Found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-secondary px-4 py-2">
          <Text className="text-xs font-semibold text-foreground">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(accountId);
      triggerHaptic('impact');
      router.back();
    } catch {
      // Ignored
    }
  };

  return (
    <FlatList
      initialNumToRender={10}
      windowSize={5}
      data={allTransactions}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => {
        const category = item.categoryId ? categoryMap.get(String(item.categoryId)) : null;
        return (
          <TransactionCard
            transaction={item}
            accountName={account.name}
            categoryName={category?.name}
            categoryColor={category?.color}
            onPress={() => openAddTransaction(String(item.id))}
          />
        );
      }}
      contentContainerClassName="gap-2.5 p-4 pb-28"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View className="gap-4 pb-3">
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
                  openAddAccount(accountId);
                }}
                className="rounded-xl bg-secondary p-2 active:bg-accent"
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Edit account"
              >
                <Edit3 size={18} className="text-foreground" />
              </Pressable>
              <Pressable
                onPress={handleDelete}
                className="rounded-xl bg-destructive/15 p-2 active:bg-destructive/30"
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Delete account"
              >
                <Trash2 size={18} color="#ef4444" />
              </Pressable>
            </View>
          </View>

          {/* Account Balance Card */}
          <Card className="rounded-2xl border-border bg-card shadow-sm p-5 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {account.institutionName || account.type}
              </Text>
              {account.accountNumberMask && (
                <Text className="text-xs font-medium text-muted-foreground">
                  {account.accountNumberMask}
                </Text>
              )}
            </View>

            <Text className="text-3xl font-extrabold tracking-tight text-foreground">
              {formatMoney(account.currentBalance.amount, account.currency)}
            </Text>

            <Text className="text-sm font-semibold text-foreground">{account.name}</Text>
          </Card>

          {/* History Header */}
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2">
            Account History ({allTransactions.length})
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-12">
          <Text className="text-sm text-muted-foreground">No transactions for this account yet.</Text>
        </View>
      }
    />
  );
}
