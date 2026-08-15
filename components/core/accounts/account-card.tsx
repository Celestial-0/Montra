import React from 'react';
import { Pressable, View } from 'react-native';
import {
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { FinancialAccount } from '@/domain/accounts';
import { formatMoney } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';

export interface AccountCardProps {
  account: FinancialAccount;
  onPress?: () => void;
}

export const AccountCard = React.memo(function AccountCard({ account, onPress }: AccountCardProps) {
  const { isDark } = useAppTheme();
  const isCredit = account.type === 'credit_card';
  const isNegative = account.currentBalance.isNegative();

  const getAccountMeta = () => {
    switch (account.type) {
      case 'bank':
        return {
          icon: Landmark,
          label: 'Bank Account',
          color: parseOklch(isDark ? 'oklch(0.75 0.14 240)' : 'oklch(0.52 0.14 240)'),
          bgColor: parseOklch(isDark ? 'oklch(0.24 0.04 240)' : 'oklch(0.94 0.03 240)'),
        };
      case 'credit_card':
        return {
          icon: CreditCard,
          label: 'Credit Card',
          color: parseOklch(isDark ? 'oklch(0.72 0.18 20)' : 'oklch(0.55 0.18 20)'),
          bgColor: parseOklch(isDark ? 'oklch(0.24 0.05 20)' : 'oklch(0.94 0.04 20)'),
        };
      case 'cash':
        return {
          icon: Wallet,
          label: 'Cash',
          color: parseOklch(isDark ? 'oklch(0.72 0.16 150)' : 'oklch(0.50 0.15 150)'),
          bgColor: parseOklch(isDark ? 'oklch(0.24 0.05 150)' : 'oklch(0.94 0.04 150)'),
        };
      case 'wallet':
        return {
          icon: PiggyBank,
          label: 'Digital Wallet',
          color: parseOklch(isDark ? 'oklch(0.78 0.16 75)' : 'oklch(0.58 0.16 75)'),
          bgColor: parseOklch(isDark ? 'oklch(0.25 0.05 75)' : 'oklch(0.95 0.04 75)'),
        };
      case 'investment':
        return {
          icon: TrendingUp,
          label: 'Investment',
          color: parseOklch(isDark ? 'oklch(0.75 0.16 300)' : 'oklch(0.54 0.16 300)'),
          bgColor: parseOklch(isDark ? 'oklch(0.24 0.05 300)' : 'oklch(0.95 0.04 300)'),
        };
      default:
        return {
          icon: Landmark,
          label: 'Account',
          color: parseOklch(isDark ? 'oklch(0.75 0.14 240)' : 'oklch(0.52 0.14 240)'),
          bgColor: parseOklch(isDark ? 'oklch(0.24 0.04 240)' : 'oklch(0.94 0.03 240)'),
        };
    }
  };

  const meta = getAccountMeta();
  const Icon = meta.icon;

  return (
    <Pressable
      onPress={() => {
        triggerHaptic('selection');
        onPress?.();
      }}
      className="active:opacity-90"
    >
      <Card className="rounded-2xl border-border/80 bg-card shadow-sm">
        <CardContent className="gap-3 p-5">
          {/* Header Row: Icon + Names */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1 flex-row items-center gap-3 pr-2">
              <View
                style={{ backgroundColor: meta.bgColor }}
                className="h-11 w-11 items-center justify-center rounded-2xl"
              >
                <Icon size={20} color={meta.color} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                  {account.name}
                </Text>
                <View className="flex-row items-center gap-1.5 pt-0.5">
                  <Text className="text-xs font-medium text-muted-foreground">
                    {account.institutionName || meta.label}
                  </Text>
                  {account.accountNumberMask && (
                    <>
                      <Text className="text-xs text-muted-foreground">•</Text>
                      <Text className="text-xs font-medium text-muted-foreground">
                        {account.accountNumberMask}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Type badge */}
            <View className="rounded-full bg-secondary px-2.5 py-1 border border-border/60">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {meta.label}
              </Text>
            </View>
          </View>

          {/* Balance Row */}
          <View className="flex-row items-baseline justify-between border-t border-border/50 pt-3">
            <Text className="text-xs font-medium text-muted-foreground">
              {isCredit ? 'Current Outstanding' : 'Available Balance'}
            </Text>
            <Text
              className={`text-xl font-extrabold tracking-tight ${
                isCredit || isNegative ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {formatMoney(account.currentBalance.amount, account.currency)}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
});
