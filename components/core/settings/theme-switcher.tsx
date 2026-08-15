import React from 'react';
import { Pressable, View } from 'react-native';
import { Moon, Sun, SunMoon } from 'lucide-react-native';
import { Uniwind, useUniwind } from 'uniwind';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { triggerHaptic } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const { themeName, colors } = useAppTheme();

  const options: { mode: 'light' | 'dark' | 'system'; label: string; icon: any }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: SunMoon },
  ];

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-row gap-2.5 pt-1">
        {options.map((opt) => {
          const isSelected = themeName === opt.mode;
          const Icon = opt.icon;
          const iconColor = isSelected
            ? colors.primary
            : colors.mutedForeground;

          return (
            <Pressable
              key={opt.mode}
              onPress={() => {
                triggerHaptic('selection');
                Uniwind.setTheme(opt.mode as any);
              }}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-2 rounded-xl border py-2.5',
                isSelected
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-secondary/50 active:bg-accent'
              )}
            >
              <Icon size={16} color={iconColor} />
              <Text
                className={cn(
                  'text-xs font-semibold',
                  isSelected ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </CardContent>
    </Card>
  );
}
