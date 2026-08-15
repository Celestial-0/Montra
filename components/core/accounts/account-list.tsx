import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeftRight, Landmark, Plus, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAccounts, useDeleteAccount } from '@/hooks/use-accounts';
import { QUERY_KEYS } from '@/lib/constants';
import { formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/lib/theme';
import { useUIStore } from '@/stores/ui-store';
import { AccountCard } from './account-card';

export function AccountList() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const queryClient = useQueryClient();
  const { openAddAccount, openAddTransfer } = useUIStore();
  const { data: accounts = [], isLoading } = useAccounts();
  const deleteMutation = useDeleteAccount();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic('impact');
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.accounts] });
    setRefreshing(false);
  };

  // Calculate Asset accounts vs Liability/Credit accounts
  const assetBalanceMinor = accounts.reduce((sum, a) => {
    if (!a.isActive || a.type === 'credit_card') return sum;
    return sum + a.currentBalance.amount;
  }, 0);

  const liabilityBalanceMinor = accounts.reduce((sum, a) => {
    if (!a.isActive || a.type !== 'credit_card') return sum;
    return sum + a.currentBalance.amount;
  }, 0);

  const netBalanceMinor = assetBalanceMinor - liabilityBalanceMinor;

  return (
    <Animated.FlatList
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
      initialNumToRender={10}
      windowSize={5}
      itemLayoutAnimation={LinearTransition}
      data={accounts}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <Swipeable
          renderRightActions={() => (
            <Pressable
              onPress={() => {
                triggerHaptic('impact');
                deleteMutation.mutateAsync(item.id);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete account"
              className="bg-destructive justify-center items-center w-20 rounded-2xl ml-2"
            >
              <Trash2 size={24} color="white" />
            </Pressable>
          )}
        >
          <AccountCard
            account={item}
            onPress={() => openAddAccount(String(item.id))}
          />
        </Swipeable>
      )}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top + 8, 16),
        paddingBottom: 110,
      }}
      contentContainerClassName="gap-3.5 px-4"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View className="gap-4 pb-2">
          {/* Title and Top Actions */}
          <View className="flex-row items-center justify-between pt-1">
            <View>
              <Text className="text-2xl font-bold tracking-tight text-foreground">
                Accounts
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                onPress={() => {
                  triggerHaptic('selection');
                  openAddTransfer();
                }}
                className="flex-row items-center gap-1.5 px-3 py-2"
              >
                <ArrowLeftRight size={14} color={colors.transfer} />
                <Text className="text-xs font-semibold text-foreground">Transfer</Text>
              </Button>
              <Button
                onPress={() => {
                  triggerHaptic('impact');
                  openAddAccount();
                }}
                className="flex-row items-center gap-1 px-3 py-2"
              >
                <Plus size={14} color={colors.primaryForeground} />
                <Text className="text-xs font-semibold text-primary-foreground">Add</Text>
              </Button>
            </View>
          </View>

          {/* Net Worth & Assets Overview */}
          <Card className="rounded-2xl border-border bg-card shadow-sm">
            <CardContent className="gap-3.5 p-5">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Financial Position
                </Text>
                <Text className="text-xs font-bold text-foreground">
                  {accounts.length} active
                </Text>
              </View>

              <View>
                <Text className="text-3xl font-extrabold tracking-tight text-foreground">
                  {formatMoney(netBalanceMinor)}
                </Text>
              </View>

              <View className="flex-row gap-3 border-t border-border/60 pt-3">
                <View className="flex-1">
                  <Text className="text-[11px] text-muted-foreground">Cash & Bank Assets</Text>
                  <Text className="text-sm font-bold text-income">
                    {formatMoney(assetBalanceMinor)}
                  </Text>
                </View>
                {liabilityBalanceMinor > 0 && (
                  <View className="flex-1">
                    <Text className="text-[11px] text-muted-foreground">Credit & Liabilities</Text>
                    <Text className="text-sm font-bold text-destructive">
                      {formatMoney(liabilityBalanceMinor)}
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="gap-3.5 mt-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-24 w-full rounded-2xl bg-muted/40" />
            ))}
          </View>
        ) : (
          <View className="w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 mt-4">
            <View className="rounded-full bg-primary/10 p-3">
              <Landmark size={24} color={colors.primary} />
            </View>
            <Text className="mt-3 text-base font-semibold text-foreground text-center">No Financial Accounts</Text>
            <Text className="mt-1 text-center text-xs text-muted-foreground px-4">
              Add your bank accounts, credit cards, or cash wallets to start organizing balances.
            </Text>
            <Button
              onPress={() => {
                triggerHaptic('impact');
                openAddAccount();
              }}
              className="mt-4 flex-row items-center gap-1.5 px-4"
            >
              <Plus size={16} color={colors.primaryForeground} />
              <Text className="font-semibold text-primary-foreground">Add First Account</Text>
            </Button>
          </View>
        )
      }
    />
  );
}
