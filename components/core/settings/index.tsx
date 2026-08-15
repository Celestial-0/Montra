import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  ChevronRight,
  Database,
  Eye,
  Tag,
  UploadCloud,
} from 'lucide-react-native';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { APP_CONFIG } from '@/lib/constants';
import { triggerHaptic } from '@/lib/haptics';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';
import { useUIStore } from '@/stores/ui-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeSwitcher } from './theme-switcher';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const router = useRouter();
  const { openAddCategory } = useUIStore();

  const workspaceTools = [
    {
      title: 'Financial Analytics',
      subtitle: 'Category breakdowns, cash flows, and trends',
      icon: BarChart3,
      iconColor: parseOklch(isDark ? 'oklch(0.72 0.16 150)' : 'oklch(0.50 0.15 150)'),
      bgColor: parseOklch(isDark ? 'oklch(0.24 0.05 150)' : 'oklch(0.94 0.04 150)'),
      onPress: () => {
        triggerHaptic('selection');
        router.push('/analytics' as any);
      },
    },
    {
      title: 'Categories & Tags',
      subtitle: 'Manage user semantics, colors, and taxons',
      icon: Tag,
      iconColor: parseOklch(isDark ? 'oklch(0.78 0.16 75)' : 'oklch(0.60 0.16 75)'),
      bgColor: parseOklch(isDark ? 'oklch(0.25 0.05 75)' : 'oklch(0.95 0.04 75)'),
      onPress: () => {
        triggerHaptic('selection');
        openAddCategory();
      },
    },
    {
      title: 'Saved Views',
      subtitle: 'Create & manage custom financial perspectives',
      icon: Eye,
      iconColor: parseOklch(isDark ? 'oklch(0.72 0.14 240)' : 'oklch(0.52 0.14 240)'),
      bgColor: parseOklch(isDark ? 'oklch(0.24 0.04 240)' : 'oklch(0.94 0.03 240)'),
      onPress: () => {
        triggerHaptic('selection');
        router.push('/views' as any);
      },
    },
    {
      title: 'Statement Ingestion',
      subtitle: 'Import bank statements via CSV / JSON',
      icon: UploadCloud,
      iconColor: parseOklch(isDark ? 'oklch(0.72 0.16 300)' : 'oklch(0.54 0.16 300)'),
      bgColor: parseOklch(isDark ? 'oklch(0.24 0.05 300)' : 'oklch(0.95 0.04 300)'),
      onPress: () => {
        triggerHaptic('selection');
        router.push('/import' as any);
      },
    },
  ];

  const dbIconColor = parseOklch(isDark ? 'oklch(0.70 0.12 180)' : 'oklch(0.48 0.12 180)');
  const dbBgColor = parseOklch(isDark ? 'oklch(0.24 0.04 180)' : 'oklch(0.94 0.03 180)');

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: Math.max(insets.top + 8, 16),
        paddingBottom: 110,
      }}
      contentContainerClassName="gap-5 px-4"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between pt-1">
        <View>
          <Text className="text-2xl font-bold tracking-tight text-foreground">
            Settings
          </Text>
          <Text className="text-xs text-muted-foreground">
            Workspace configuration & tools
          </Text>
        </View>
        <BrandLogo size={32} />
      </View>

      {/* Appearance Theme Switcher */}
      <ThemeSwitcher />

      {/* Financial Tools Section */}
      <View className="gap-2.5">
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Semantic Tools
        </Text>
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
          {workspaceTools.map((tool, index) => {
            const Icon = tool.icon;
            const isLast = index === workspaceTools.length - 1;
            return (
              <Pressable
                key={tool.title}
                onPress={tool.onPress}
                className={`flex-row items-center justify-between p-4 active:bg-secondary/60 ${
                  !isLast ? 'border-b border-border/60' : ''
                }`}
              >
                <View className="flex-1 flex-row items-center gap-3.5 pr-2">
                  <View
                    style={{ backgroundColor: tool.bgColor }}
                    className="h-10 w-10 items-center justify-center rounded-xl"
                  >
                    <Icon size={19} color={tool.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">{tool.title}</Text>
                    <Text className="text-xs text-muted-foreground">{tool.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={isDark ? '#71717a' : '#9ca3af'} />
              </Pressable>
            );
          })}
        </Card>
      </View>

      {/* Local-First Architecture Badge Card */}
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardContent className="gap-3 p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View
                style={{ backgroundColor: dbBgColor }}
                className="h-8 w-8 items-center justify-center rounded-xl"
              >
                <Database size={16} color={dbIconColor} />
              </View>
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Local-First Engine
              </Text>
            </View>
            <View className="rounded-full bg-income-muted/40 px-2.5 py-0.5 border border-income/30">
              <Text className="text-[10px] font-bold text-income">Offline Ready</Text>
            </View>
          </View>

          <Text className="text-xs text-muted-foreground leading-relaxed">
            Montra operates completely on-device using SQLite with Drizzle ORM. Your financial facts
            are stored in <Text className="font-semibold text-foreground">{APP_CONFIG.databaseName}</Text> and
            never transmitted to external servers without explicit user intent.
          </Text>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
