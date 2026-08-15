import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeftRight, Landmark, Plus, UploadCloud } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { triggerHaptic } from '@/lib/haptics';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';
import { useUIStore } from '@/stores/ui-store';

export function QuickActionBar() {
  const router = useRouter();
  const { isDark, colors } = useAppTheme();
  const { openAddTransaction, openAddTransfer, openAddAccount } = useUIStore();

  const actions = [
    {
      label: 'Record',
      icon: Plus,
      isPrimary: true,
      iconColor: colors.primaryForeground,
      bgColor: colors.primary,
      onPress: () => {
        triggerHaptic('impact');
        openAddTransaction();
      },
    },
    {
      label: 'Transfer',
      icon: ArrowLeftRight,
      isPrimary: false,
      iconColor: parseOklch(isDark ? 'oklch(0.75 0.14 240)' : 'oklch(0.52 0.14 240)'),
      bgColor: parseOklch(isDark ? 'oklch(0.24 0.04 240)' : 'oklch(0.94 0.03 240)'),
      onPress: () => {
        triggerHaptic('selection');
        openAddTransfer();
      },
    },
    {
      label: 'Account',
      icon: Landmark,
      isPrimary: false,
      iconColor: parseOklch(isDark ? 'oklch(0.78 0.16 75)' : 'oklch(0.58 0.16 75)'),
      bgColor: parseOklch(isDark ? 'oklch(0.25 0.05 75)' : 'oklch(0.95 0.04 75)'),
      onPress: () => {
        triggerHaptic('selection');
        openAddAccount();
      },
    },
    {
      label: 'Import',
      icon: UploadCloud,
      isPrimary: false,
      iconColor: parseOklch(isDark ? 'oklch(0.75 0.16 300)' : 'oklch(0.54 0.16 300)'),
      bgColor: parseOklch(isDark ? 'oklch(0.24 0.05 300)' : 'oklch(0.95 0.04 300)'),
      onPress: () => {
        triggerHaptic('selection');
        router.push('/import' as any);
      },
    },
  ];

  return (
    <View className="flex-row gap-2.5">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            className={`flex-1 items-center justify-center gap-1.5 rounded-2xl p-3 border active:scale-[0.96] shadow-xs ${
              action.isPrimary
                ? 'bg-primary border-primary active:opacity-90'
                : 'bg-card border-border/80 active:bg-secondary/70'
            }`}
          >
            <View
              style={action.isPrimary ? undefined : { backgroundColor: action.bgColor }}
              className={`items-center justify-center rounded-xl p-2 ${
                action.isPrimary ? 'bg-primary-foreground/15' : ''
              }`}
            >
              <Icon size={16} color={action.iconColor} />
            </View>
            <Text
              className={`text-xs font-semibold tracking-tight ${
                action.isPrimary ? 'text-primary-foreground font-bold' : 'text-foreground'
              }`}
            >
              {action.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
