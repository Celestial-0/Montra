import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Filter, RotateCcw, X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TransactionType } from '@/domain/transactions';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const TRANSACTION_TYPES: { type: TransactionType; label: string }[] = [
  { type: 'expense', label: 'Expenses' },
  { type: 'income', label: 'Income' },
  { type: 'transfer', label: 'Transfers' },
  { type: 'refund', label: 'Refunds' },
  { type: 'adjustment', label: 'Adjustments' },
];

export function TransactionFilterSheet() {
  const { modals, closeFilterPanel, filters, setFilter, resetFilters } = useUIStore();
  const isOpen = modals.isFilterPanelOpen;

  const { data: accounts = [] } = useAccounts();
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];
  const tags = catData?.tags ?? [];

  if (!isOpen) return null;

  const toggleAccount = (accId: string) => {
    const current = filters.accountIds;
    if (current.includes(accId)) {
      setFilter('accountIds', current.filter((id) => id !== accId));
    } else {
      setFilter('accountIds', [...current, accId]);
    }
  };

  const toggleCategory = (catId: string) => {
    const current = filters.categoryIds;
    if (current.includes(catId)) {
      setFilter('categoryIds', current.filter((id) => id !== catId));
    } else {
      setFilter('categoryIds', [...current, catId]);
    }
  };

  const toggleType = (t: TransactionType) => {
    const current = filters.types;
    if (current.includes(t)) {
      setFilter('types', current.filter((type) => type !== t));
    } else {
      setFilter('types', [...current, t]);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeFilterPanel}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="max-h-[85%] rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-primary/10 p-2">
                <Filter size={18} className="text-primary" />
              </View>
              <Text className="text-xl font-bold text-card-foreground">Filter Transactions</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => {
                  resetFilters();
                  triggerHaptic('selection');
                }}
                className="flex-row items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 active:bg-accent"
              >
                <RotateCcw size={14} className="text-muted-foreground" />
                <Text className="text-xs font-medium text-muted-foreground">Reset</Text>
              </Pressable>
              <Pressable
                onPress={closeFilterPanel}
                className="rounded-full bg-secondary p-2 active:bg-accent"
              >
                <X size={20} className="text-muted-foreground" />
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-5 pb-6">
            {/* Transaction Types */}
            <View>
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transaction Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TRANSACTION_TYPES.map((t) => {
                  const isSelected = filters.types.includes(t.type);
                  return (
                    <Pressable
                      key={t.type}
                      onPress={() => {
                        toggleType(t.type);
                        triggerHaptic('selection');
                      }}
                      className={cn(
                        'rounded-full border px-3 py-1.5',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-border bg-secondary'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-medium',
                          isSelected ? 'text-primary-foreground font-semibold' : 'text-foreground'
                        )}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Accounts */}
            {accounts.length > 0 && (
              <View>
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Accounts
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {accounts.map((acc) => {
                    const isSelected = filters.accountIds.includes(String(acc.id));
                    return (
                      <Pressable
                        key={String(acc.id)}
                        onPress={() => {
                          toggleAccount(String(acc.id));
                          triggerHaptic('selection');
                        }}
                        className={cn(
                          'rounded-xl border px-3 py-2',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/50'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-medium',
                            isSelected ? 'font-semibold text-primary' : 'text-foreground'
                          )}
                        >
                          {acc.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <View>
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = filters.categoryIds.includes(String(cat.id));
                    return (
                      <Pressable
                        key={String(cat.id)}
                        onPress={() => {
                          toggleCategory(String(cat.id));
                          triggerHaptic('selection');
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1.5',
                          isSelected
                            ? 'border-primary bg-primary'
                            : 'border-border bg-secondary'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-medium',
                            isSelected ? 'text-primary-foreground font-semibold' : 'text-foreground'
                          )}
                        >
                          {cat.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Apply Button */}
            <Button
              onPress={() => {
                triggerHaptic('selection');
                closeFilterPanel();
              }}
              className="mt-2 py-3"
            >
              <Text className="font-semibold text-primary-foreground">Apply Filters</Text>
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
