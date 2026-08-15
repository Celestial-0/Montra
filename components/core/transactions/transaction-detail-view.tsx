import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Calendar,
  Edit3,
  FileText,
  Landmark,
  Tag,
  Trash2,
} from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useDeleteTransaction, useTransaction } from '@/hooks/use-transactions';
import { formatMoney, formatTransactionDate } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useUIStore } from '@/stores/ui-store';

export function TransactionDetailView({ transactionId }: { transactionId: string }) {
  const router = useRouter();
  const { openAddTransaction } = useUIStore();
  const { data: transaction, isLoading } = useTransaction(transactionId);
  const { data: accounts = [] } = useAccounts();
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];
  const deleteMutation = useDeleteTransaction();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-base font-semibold text-foreground">Transaction Not Found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-secondary px-4 py-2">
          <Text className="text-xs font-semibold text-foreground">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const account = accounts.find((a) => String(a.id) === String(transaction.accountId));
  const category = transaction.categoryId
    ? categories.find((c) => String(c.id) === String(transaction.categoryId))
    : null;

  const isTransfer = transaction.isTransfer();
  const isIncome = transaction.type === 'income';

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(transactionId);
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
              openAddTransaction(transactionId);
            }}
            className="rounded-xl bg-secondary p-2 active:bg-accent"
          >
            <Edit3 size={18} className="text-foreground" />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            className="rounded-xl bg-destructive/15 p-2 active:bg-destructive/30"
          >
            <Trash2 size={18} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      {/* Main Amount Card */}
      <Card className="rounded-2xl border-border bg-card shadow-sm items-center p-6 gap-2">
        <View
          className={`h-14 w-14 items-center justify-center rounded-2xl ${
            isTransfer
              ? 'bg-transfer-muted/50'
              : isIncome
              ? 'bg-income-muted/40'
              : 'bg-destructive/15'
          }`}
        >
          {isTransfer ? (
            <ArrowLeftRight size={24} color="#3b82f6" />
          ) : isIncome ? (
            <ArrowUpRight size={24} color="#22c55e" />
          ) : (
            <ArrowDownLeft size={24} color="#ef4444" />
          )}
        </View>

        <Text
          className={`text-3xl font-extrabold tracking-tight mt-1 ${
            isTransfer
              ? 'text-transfer'
              : isIncome
              ? 'text-income'
              : 'text-foreground'
          }`}
        >
          {isTransfer
            ? formatMoney(transaction.amount.amount, transaction.amount.currency)
            : isIncome
            ? `+${formatMoney(transaction.amount.amount, transaction.amount.currency)}`
            : `-${formatMoney(transaction.amount.amount, transaction.amount.currency)}`}
        </Text>

        <Text className="text-base font-semibold text-foreground text-center">
          {transaction.description || category?.name || (isTransfer ? 'Transfer' : 'Transaction')}
        </Text>

        <Text className="text-xs text-muted-foreground">
          {formatTransactionDate(transaction.occurredAt)}
        </Text>
      </Card>

      {/* Details List */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Account */}
          <View className="flex-row items-center justify-between p-4 border-b border-border/50">
            <View className="flex-row items-center gap-2.5">
              <Landmark size={16} className="text-muted-foreground" />
              <Text className="text-xs font-medium text-muted-foreground">Account</Text>
            </View>
            <Text className="text-sm font-semibold text-foreground">
              {account?.name ?? 'Unknown Account'}
            </Text>
          </View>

          {/* Category */}
          {category && (
            <View className="flex-row items-center justify-between p-4 border-b border-border/50">
              <View className="flex-row items-center gap-2.5">
                <Tag size={16} className="text-muted-foreground" />
                <Text className="text-xs font-medium text-muted-foreground">Category</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                {category.color && (
                  <View
                    style={{ backgroundColor: category.color }}
                    className="h-2.5 w-2.5 rounded-full"
                  />
                )}
                <Text className="text-sm font-semibold text-foreground">{category.name}</Text>
              </View>
            </View>
          )}

          {/* Source Provenance */}
          <View className="flex-row items-center justify-between p-4 border-b border-border/50">
            <Text className="text-xs font-medium text-muted-foreground">Source Acquisition</Text>
            <Text className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {transaction.sourceReference?.sourceType ?? 'Manual'}
            </Text>
          </View>

          {/* Notes */}
          {transaction.notes && (
            <View className="p-4 gap-1">
              <Text className="text-xs font-medium text-muted-foreground">Notes</Text>
              <Text className="text-sm text-foreground">{transaction.notes}</Text>
            </View>
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
}
