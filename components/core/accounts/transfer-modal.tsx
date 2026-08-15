import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { ArrowLeftRight, X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAccounts } from '@/hooks/use-accounts';
import { useCreateTransfer } from '@/hooks/use-transactions';
import { formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

export function TransferModal() {
  const { modals, closeAddTransfer } = useUIStore();
  const isOpen = modals.isAddTransferOpen;

  const { data: accounts = [] } = useAccounts();
  const createTransfer = useCreateTransfer();

  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amountStr, setAmountStr] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (accounts.length >= 2) {
        setFromAccountId(String(accounts[0].id));
        setToAccountId(String(accounts[1].id));
      } else if (accounts.length === 1) {
        setFromAccountId(String(accounts[0].id));
        setToAccountId('');
      }
      setAmountStr('');
      setNotes('');
      setErrorMsg(null);
    }
  }, [isOpen, accounts.length]);

  if (!isOpen) return null;

  const handleTransfer = async () => {
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid transfer amount.');
      return;
    }
    if (!fromAccountId || !toAccountId) {
      setErrorMsg('Please select both source and destination accounts.');
      return;
    }
    if (fromAccountId === toAccountId) {
      setErrorMsg('Source and destination accounts must be different.');
      return;
    }

    const amountMinor = Math.round(parsedAmount * 100);

    try {
      await createTransfer.mutateAsync({
        sourceAccountId: fromAccountId,
        targetAccountId: toAccountId,
        amountMinor,
        notes: notes.trim() || undefined,
        occurredAt: new Date().toISOString(),
      });
      triggerHaptic('success');
      closeAddTransfer();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to execute transfer');
    }
  };

  const isPending = createTransfer.isPending;

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeAddTransfer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="max-h-[90%] rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-transfer-muted/50 p-2">
                <ArrowLeftRight size={18} className="text-transfer" color="#3b82f6" />
              </View>
              <Text className="text-xl font-bold text-card-foreground">Transfer Funds</Text>
            </View>
            <Pressable
              onPress={closeAddTransfer}
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

            {/* Amount */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount to Transfer
              </Text>
              <View className="flex-row items-center rounded-xl border border-input bg-background px-4 py-3">
                <Text className="mr-2 text-2xl font-bold text-muted-foreground">₹</Text>
                <TextInput
                  value={amountStr}
                  onChangeText={setAmountStr}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 text-2xl font-bold text-foreground"
                />
              </View>
            </View>

            {/* From Account */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                From Account (Debit)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                {accounts.map((acc) => {
                  const isSelected = fromAccountId === String(acc.id);
                  return (
                    <Pressable
                      key={`from-${String(acc.id)}`}
                      onPress={() => {
                        setFromAccountId(String(acc.id));
                        triggerHaptic('selection');
                      }}
                      className={cn(
                        'rounded-xl border px-3.5 py-2',
                        isSelected
                          ? 'border-destructive bg-destructive/10'
                          : 'border-border bg-card'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-semibold',
                          isSelected ? 'text-destructive' : 'text-foreground'
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

            {/* To Account */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                To Account (Credit)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
                {accounts.map((acc) => {
                  const isSelected = toAccountId === String(acc.id);
                  const isFrom = fromAccountId === String(acc.id);
                  return (
                    <Pressable
                      key={`to-${String(acc.id)}`}
                      onPress={() => {
                        if (!isFrom) {
                          setToAccountId(String(acc.id));
                          triggerHaptic('selection');
                        }
                      }}
                      className={cn(
                        'rounded-xl border px-3.5 py-2',
                        isSelected
                          ? 'border-income bg-income-muted/30'
                          : isFrom
                          ? 'border-border/40 bg-secondary/40 opacity-40'
                          : 'border-border bg-card'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-semibold',
                          isSelected ? 'text-income' : 'text-foreground'
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

            {/* Notes */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes (Optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Card payment, ATM cash withdrawal"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground"
              />
            </View>

            {/* Action Button */}
            <Button
              onPress={handleTransfer}
              disabled={isPending || accounts.length < 2}
              className="mt-2 py-3"
            >
              <Text className="font-semibold text-primary-foreground">
                {accounts.length < 2 ? 'Need 2 Accounts to Transfer' : 'Confirm Transfer'}
              </Text>
            </Button>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
