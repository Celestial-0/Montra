import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { PieChart, Trash2, X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { BudgetScopeType, PeriodCadence } from '@/domain/budgets';
import { useBudgets, useCreateBudget, useDeleteBudget, useUpdateBudget } from '@/hooks/use-budgets';
import { useCategories } from '@/hooks/use-categories';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui-store';

const CADENCES: { cadence: PeriodCadence; label: string }[] = [
  { cadence: 'monthly', label: 'Monthly' },
  { cadence: 'weekly', label: 'Weekly' },
  { cadence: 'yearly', label: 'Yearly' },
];

export function BudgetModal() {
  const { modals, closeAddBudget } = useUIStore();
  const isOpen = modals.isAddBudgetOpen;
  const editingId = modals.editingBudgetId;

  const { data: budgets = [] } = useBudgets();
  const existingBudget = budgets.find((b) => String(b.id) === editingId);

  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];

  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [scopeType, setScopeType] = useState<BudgetScopeType>('all');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [cadence, setCadence] = useState<PeriodCadence>('monthly');
  const [alertThreshold, setAlertThreshold] = useState('80');
  const [rolloverEnabled, setRolloverEnabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingBudget && editingId) {
        setName(existingBudget.name);
        setTargetAmountStr(String(existingBudget.targetAmount.toMajor()));
        setScopeType(existingBudget.scope.type);
        setSelectedCategoryIds([...existingBudget.scope.targetIds]);
        setCadence(existingBudget.period.cadence);
        setAlertThreshold(String(existingBudget.alertThresholdPercent ?? 80));
        setRolloverEnabled(existingBudget.rolloverEnabled);
      } else {
        setName('');
        setTargetAmountStr('');
        setScopeType('all');
        setSelectedCategoryIds([]);
        setCadence('monthly');
        setAlertThreshold('80');
        setRolloverEnabled(false);
      }
      setErrorMsg(null);
    }
  }, [isOpen, editingId, existingBudget]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter a budget name.');
      return;
    }

    const parsedTarget = parseFloat(targetAmountStr);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorMsg('Please enter a valid target amount.');
      return;
    }

    const targetAmountMinor = Math.round(parsedTarget * 100);
    const parsedThreshold = parseInt(alertThreshold, 10);
    const alertThresholdPercent = isNaN(parsedThreshold) ? 80 : parsedThreshold;

    try {
      if (editingId && existingBudget) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: name.trim(),
          targetAmountMinor,
          alertThresholdPercent,
          rolloverEnabled,
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          targetAmountMinor,
          scopeType,
          targetIds: scopeType === 'category' ? selectedCategoryIds : undefined,
          cadence,
          startDate: new Date().toISOString(),
          rolloverEnabled,
          alertThresholdPercent,
        });
      }
      triggerHaptic('success');
      closeAddBudget();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to save budget');
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    try {
      await deleteMutation.mutateAsync(editingId);
      triggerHaptic('impact');
      closeAddBudget();
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to delete budget');
    }
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={closeAddBudget}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <View className="max-h-[90%] rounded-t-3xl border-t border-border bg-card p-6 shadow-2xl">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="rounded-full bg-primary/10 p-2">
                <PieChart size={18} className="text-primary" />
              </View>
              <Text className="text-xl font-bold text-card-foreground">
                {editingId ? 'Edit Budget' : 'New Spending Budget'}
              </Text>
            </View>
            <Pressable
              onPress={closeAddBudget}
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

            {/* Budget Name */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Budget Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Monthly Total, Dining Out, Utilities"
                placeholderTextColor="#9ca3af"
                className="rounded-xl border border-input bg-background px-4 py-3 text-base font-semibold text-foreground"
              />
            </View>

            {/* Target Amount */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Spending Limit
              </Text>
              <View className="flex-row items-center rounded-xl border border-input bg-background px-4 py-3">
                <Text className="mr-2 text-xl font-bold text-muted-foreground">₹</Text>
                <TextInput
                  value={targetAmountStr}
                  onChangeText={setTargetAmountStr}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 text-xl font-bold text-foreground"
                />
              </View>
            </View>

            {/* Scope Type */}
            {!editingId && (
              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Scope
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      setScopeType('all');
                      triggerHaptic('selection');
                    }}
                    className={cn(
                      'flex-1 rounded-xl border p-3 items-center',
                      scopeType === 'all'
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/50'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-semibold',
                        scopeType === 'all' ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      Overall / All Spending
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setScopeType('category');
                      triggerHaptic('selection');
                    }}
                    className={cn(
                      'flex-1 rounded-xl border p-3 items-center',
                      scopeType === 'category'
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/50'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-xs font-semibold',
                        scopeType === 'category' ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      Specific Categories
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Specific Categories Picker */}
            {!editingId && scopeType === 'category' && (
              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Select Categories for this Budget
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(String(cat.id));
                    return (
                      <Pressable
                        key={String(cat.id)}
                        onPress={() => toggleCategory(String(cat.id))}
                        className={cn(
                          'rounded-full border px-3 py-1.5',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-secondary'
                        )}
                      >
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
                </View>
              </View>
            )}

            {/* Period Cadence */}
            {!editingId && (
              <View>
                <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Period Cadence
                </Text>
                <View className="flex-row gap-2">
                  {CADENCES.map((c) => {
                    const isSelected = cadence === c.cadence;
                    return (
                      <Pressable
                        key={c.cadence}
                        onPress={() => {
                          setCadence(c.cadence);
                          triggerHaptic('selection');
                        }}
                        className={cn(
                          'flex-1 rounded-xl border py-2.5 items-center',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/50'
                        )}
                      >
                        <Text
                          className={cn(
                            'text-xs font-semibold',
                            isSelected ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Alert Threshold */}
            <View>
              <Text className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Alert Threshold (%)
              </Text>
              <TextInput
                value={alertThreshold}
                onChangeText={setAlertThreshold}
                placeholder="80"
                keyboardType="number-pad"
                className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground"
              />
            </View>

            {/* Rollover Toggle */}
            <View className="flex-row items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
              <View className="flex-1 pr-4">
                <Text className="text-sm font-semibold text-foreground">Budget Rollover</Text>
                <Text className="text-xs text-muted-foreground">
                  Carry forward unspent balance to next period
                </Text>
              </View>
              <Switch value={rolloverEnabled} onValueChange={setRolloverEnabled} />
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
                  {editingId ? 'Save Changes' : 'Create Budget'}
                </Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
