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
import { Landmark, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { AccountType } from '@/domain/accounts';
import { CurrencyCode } from '@/domain/shared';
import {
  useAccount,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/hooks/use-accounts';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const ACCOUNT_TYPES: { type: AccountType; label: string }[] = [
  { type: 'bank', label: 'Bank Account' },
  { type: 'credit_card', label: 'Credit Card' },
  { type: 'cash', label: 'Cash' },
  { type: 'wallet', label: 'Digital Wallet / UPI' },
  { type: 'investment', label: 'Investment' },
  { type: 'other', label: 'Other' },
];

export function AccountModal() {
  const { modals, closeAddAccount } = useUIStore();
  const isOpen = modals.isAddAccountOpen;
  const editingId = modals.editingAccountId;

  const { data: existingAccount } = useAccount(editingId);
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [initialBalanceStr, setInitialBalanceStr] = useState('0.00');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [institutionName, setInstitutionName] = useState('');
  const [accountNumberMask, setAccountNumberMask] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingAccount && editingId) {
        setName(existingAccount.name);
        setType(existingAccount.type);
        setInitialBalanceStr(String(existingAccount.initialBalance.toMajor()));
        setCurrency(existingAccount.currency);
        setInstitutionName(existingAccount.institutionName ?? '');
        setAccountNumberMask(existingAccount.accountNumberMask ?? '');
      } else {
        setName('');
        setType('bank');
        setInitialBalanceStr('0.00');
        setCurrency('INR');
        setInstitutionName('');
        setAccountNumberMask('');
      }
      setErrorMsg(null);
    }
  }, [isOpen, editingId, existingAccount]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter an account name.');
      return;
    }

    const parsedBalance = parseFloat(initialBalanceStr);
    const initialBalanceMinor = isNaN(parsedBalance) ? 0 : Math.round(parsedBalance * 100);

    try {
      if (editingId && existingAccount) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: name.trim(),
          institutionName: institutionName.trim() || undefined,
          accountNumberMask: accountNumberMask.trim() || undefined,
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          type,
          currency,
          initialBalanceMinor,
          institutionName: institutionName.trim() || undefined,
          accountNumberMask: accountNumberMask.trim() || undefined,
        });
      }
      triggerHaptic('success');
      closeAddAccount();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to save account');
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await deleteMutation.mutateAsync(editingId);
      triggerHaptic('impact');
      closeAddAccount();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to delete account');
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeAddAccount}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="max-h-[90%] rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-primary/10 p-2">
                <Landmark size={18} className="text-primary" />
              </View>
              <Text className="text-xl font-bold text-card-foreground">
                {editingId ? 'Edit Account' : 'New Financial Account'}
              </Text>
            </View>
            <Pressable
              onPress={closeAddAccount}
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

            {/* Account Name */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. HDFC Salary, SBI Savings, Cash"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-input bg-background px-4 py-3 text-base font-semibold text-foreground"
              />
            </View>

            {/* Account Type */}
            {!editingId && (
              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account Type
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {ACCOUNT_TYPES.map((t) => {
                    const isSelected = type === t.type;
                    return (
                      <Pressable
                        key={t.type}
                        onPress={() => {
                          setType(t.type);
                          triggerHaptic('selection');
                        }}
                        className={cn(
                          'rounded-xl border px-3 py-2',
                          isSelected
                            ? 'border-primary bg-primary/15'
                            : 'border-border bg-secondary/50'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-semibold',
                            isSelected ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Initial Balance */}
            {!editingId && (
              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Initial Balance
                </Text>
                <View className="flex-row items-center rounded-xl border border-input bg-background px-4 py-3">
                  <Text className="mr-2 text-xl font-bold text-muted-foreground">₹</Text>
                  <TextInput
                    value={initialBalanceStr}
                    onChangeText={setInitialBalanceStr}
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    className="flex-1 text-xl font-bold text-foreground"
                  />
                </View>
              </View>
            )}

            {/* Institution Name */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Institution (Optional)
              </Text>
              <TextInput
                value={institutionName}
                onChangeText={setInstitutionName}
                placeholder="e.g. HDFC Bank, ICICI, Zerodha"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground"
              />
            </View>

            {/* Account Mask */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Number Mask (Optional)
              </Text>
              <TextInput
                value={accountNumberMask}
                onChangeText={setAccountNumberMask}
                placeholder="e.g. •••• 4589"
                placeholderTextColor="#9ca3af"
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
              <Button onPress={handleSave} disabled={isSaving} className="flex-1 py-3">
                <Text className="font-semibold text-primary-foreground">
                  {editingId ? 'Save Changes' : 'Create Account'}
                </Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
