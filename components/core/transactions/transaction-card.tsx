import React from 'react';
import { Pressable, View } from 'react-native';
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Transaction } from '@/domain/transactions';
import { formatTransactionDate, formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';

export interface TransactionCardProps {
  transaction: Transaction;
  accountName?: string;
  categoryName?: string;
  categoryColor?: string | null;
  onPress?: () => void;
}

export const TransactionCard = React.memo(function TransactionCard({
  transaction,
  accountName = 'Account',
  categoryName,
  categoryColor,
  onPress,
}: TransactionCardProps) {
  const { colors } = useAppTheme();
  const isTransfer = transaction.isTransfer();
  const isIncome = transaction.type === 'income';

  const parsedCatColor = categoryColor ? parseOklch(categoryColor) : null;

  return (
    <Pressable
      onPress={() => {
        triggerHaptic('selection');
        onPress?.();
      }}
      className="flex-row items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm active:bg-secondary/60"
    >
      {/* Left Column: Icon & Metadata */}
      <View className="flex-1 flex-row items-center gap-3.5 pr-3">
        {/* Type / Category Icon Container */}
        <View
          style={parsedCatColor ? { backgroundColor: `${parsedCatColor}20` } : undefined}
          className={`h-11 w-11 items-center justify-center rounded-2xl ${
            !parsedCatColor
              ? isTransfer
                ? 'bg-transfer-muted/50'
                : isIncome
                ? 'bg-income-muted/40'
                : 'bg-destructive/15'
              : ''
          }`}
        >
          {isTransfer ? (
            <ArrowLeftRight size={18} color={colors.transfer} />
          ) : isIncome ? (
            <ArrowUpRight size={18} color={colors.income} />
          ) : (
            <ArrowDownLeft size={18} color={parsedCatColor || colors.destructive} />
          )}
        </View>

        {/* Text Details */}
        <View className="flex-1">
          <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
            {transaction.description || categoryName || (isTransfer ? 'Transfer' : 'Transaction')}
          </Text>

          <View className="flex-row flex-wrap items-center gap-1.5 pt-1">
            <Text className="text-xs font-medium text-muted-foreground">{accountName}</Text>
            {categoryName && (
              <>
                <Text className="text-xs text-muted-foreground">•</Text>
                <Text className="text-xs font-medium text-muted-foreground">{categoryName}</Text>
              </>
            )}
            <Text className="text-xs text-muted-foreground">•</Text>
            <Text className="text-xs text-muted-foreground">
              {formatTransactionDate(transaction.occurredAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Right Column: Amount */}
      <View className="items-end">
        <Text
          className={`text-base font-extrabold tracking-tight ${
            isTransfer
              ? 'text-foreground'
              : isIncome
              ? 'text-income'
              : 'text-destructive'
          }`}
        >
          {isTransfer ? '' : isIncome ? '+' : '-'}
          {formatMoney(transaction.amount.amount, transaction.amount.currency)}
        </Text>
      </View>
    </Pressable>
  );
});
