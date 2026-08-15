import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowDownLeft, ArrowUpRight, Check, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from '@/hooks/use-transactions';
import { formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

export function TransactionModal() {
  const { modals, closeAddTransaction } = useUIStore();
  const isOpen = modals.isAddTransactionOpen;
  const editingId = modals.editingTransactionId;

  const { data: accounts = [] } = useAccounts();
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];
  const tags = catData?.tags ?? [];

  const { data: existingTx } = useTransaction(editingId);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate state when editing or resetting
  useEffect(() => {
    if (isOpen) {
      if (existingTx && editingId) {
        setType(existingTx.type === 'income' ? 'income' : 'expense');
        setAmountStr(String(existingTx.amount.toMajor()));
        setSelectedAccountId(String(existingTx.accountId));
        setSelectedCategoryId(existingTx.categoryId ? String(existingTx.categoryId) : null);
        setSelectedTagIds(existingTx.tagIds.map(String));
        setDescription(existingTx.description ?? '');
        setNotes(existingTx.notes ?? '');
      } else {
        setType('expense');
        setAmountStr('');
        setSelectedAccountId(accounts.length > 0 ? String(accounts[0].id) : '');
        setSelectedCategoryId(categories.length > 0 ? String(categories[0].id) : null);
        setSelectedTagIds([]);
        setDescription('');
        setNotes('');
      }
      setErrorMsg(null);
    }
  }, [isOpen, editingId, existingTx, accounts.length]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid positive amount.');
      return;
    }
    if (!selectedAccountId) {
      setErrorMsg('Please select an account.');
      return;
    }

    const amountMinor = Math.round(parsedAmount * 100);

    try {
      if (editingId && existingTx) {
        await updateMutation.mutateAsync({
          id: editingId,
          description: description.trim() || undefined,
          categoryId: selectedCategoryId,
          tagIds: selectedTagIds,
          notes: notes.trim() || undefined,
        });
      } else {
        await createMutation.mutateAsync({
          accountId: selectedAccountId,
          amountMinor,
          direction: type === 'expense' ? 'debit' : 'credit',
          type,
          description: description.trim() || undefined,
          categoryId: selectedCategoryId ?? undefined,
          tagIds: selectedTagIds,
          notes: notes.trim() || undefined,
          occurredAt: new Date().toISOString(),
        });
      }
      triggerHaptic('success');
      closeAddTransaction();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to save transaction');
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await deleteMutation.mutateAsync(editingId);
      triggerHaptic('impact');
      closeAddTransaction();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to delete transaction');
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((t) => t !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeAddTransaction}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="max-h-[90%] rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl">
          {/* Modal Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-card-foreground">
              {editingId ? 'Edit Transaction' : 'New Transaction'}
            </Text>
            <Pressable
              onPress={closeAddTransaction}
              className="rounded-full bg-secondary p-2 active:bg-accent"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <X size={20} className="text-muted-foreground" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-5 pb-6">
            {errorMsg && (
              <View className="rounded-lg bg-destructive/15 p-3 border border-destructive/30">
                <Text className="text-sm font-medium text-destructive">{errorMsg}</Text>
              </View>
            )}

            {/* Type Selector (Expense / Income) */}
            {!editingId && (
              <View className="flex-row rounded-xl bg-secondary p-1">
                <Pressable
                  onPress={() => {
                    setType('expense');
                    triggerHaptic('selection');
                  }}
                  className={cn(
                    'flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2.5 transition-colors',
                    type === 'expense' ? 'bg-destructive/20 border border-destructive/40 shadow-sm' : ''
                  )}
                >
                  <ArrowDownLeft
                    size={16}
                    color={type === 'expense' ? '#ef4444' : '#6b7280'}
                  />
                  <Text
                    className={cn(
                      'text-sm font-semibold',
                      type === 'expense' ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    Expense
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setType('income');
                    triggerHaptic('selection');
                  }}
                  className={cn(
                    'flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2.5 transition-colors',
                    type === 'income' ? 'bg-income-muted/40 border border-income/40 shadow-sm' : ''
                  )}
                >
                  <ArrowUpRight
                    size={16}
                    color={type === 'income' ? '#22c55e' : '#6b7280'}
                  />
                  <Text
                    className={cn(
                      'text-sm font-semibold',
                      type === 'income' ? 'text-income' : 'text-muted-foreground'
                    )}
                  >
                    Income
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Amount Input */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount
              </Text>
              <View className="flex-row items-center rounded-xl border border-input bg-background px-4 py-3">
                <Text className="mr-2 text-2xl font-bold text-muted-foreground">₹</Text>
                <TextInput
                  value={amountStr}
                  onChangeText={setAmountStr}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  editable={!editingId}
                  className="flex-1 text-2xl font-bold text-foreground"
                />
              </View>
            </View>

            {/* Account Selector */}
            {!editingId && (
              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                  {accounts.map((acc) => {
                    const isSelected = selectedAccountId === String(acc.id);
                    return (
                      <Pressable
                        key={String(acc.id)}
                        onPress={() => {
                          setSelectedAccountId(String(acc.id));
                          triggerHaptic('selection');
                        }}
                        className={cn(
                          'rounded-xl border px-3.5 py-2',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-semibold',
                            isSelected ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {acc.name}
                        </Text>
                        <Text className="text-[10px] text-muted-foreground">
                          {formatMoney(acc.currentBalance.amount, acc.currency)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Category Selector */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === String(cat.id);
                  return (
                    <Pressable
                      key={String(cat.id)}
                      onPress={() => {
                        setSelectedCategoryId(String(cat.id));
                        triggerHaptic('selection');
                      }}
                      className={cn(
                        'flex-row items-center gap-1.5 rounded-full border px-3 py-1.5',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-secondary'
                      )}
                    >
                      {isSelected && <Check size={12} color="white" />}
                      <Text
                        className={cn(
                          'text-xs font-medium',
                          isSelected ? 'text-primary-foreground' : 'text-foreground'
                        )}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Tags Selector (Optional) */}
            {tags.length > 0 && (
              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags (Optional)
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {tags.map((t) => {
                    const isSelected = selectedTagIds.includes(String(t.id));
                    return (
                      <Pressable
                        key={String(t.id)}
                        onPress={() => toggleTag(String(t.id))}
                        className={cn(
                          'rounded-md border px-2.5 py-1',
                          isSelected
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-border bg-secondary/50'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-[11px]',
                            isSelected ? 'font-semibold text-primary' : 'text-muted-foreground'
                          )}
                        >
                          #{t.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Description Input */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Grocery shopping, Salary deposit"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground"
              />
            </View>

            {/* Notes Input */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional details (optional)"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground"
              />
            </View>

            {/* Action Buttons */}
            <View className="mt-2 flex-row gap-3">
              {editingId && (
                <Button
                  variant="destructive"
                  onPress={handleDelete}
                  disabled={isSaving}
                  className="px-4"
                >
                  <Trash2 size={16} color="white" />
                </Button>
              )}
              <Button
                onPress={handleSave}
                disabled={isSaving}
                className="flex-1 py-3"
              >
                <Text className="font-semibold text-primary-foreground">
                  {editingId ? 'Save Changes' : 'Create Transaction'}
                </Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
