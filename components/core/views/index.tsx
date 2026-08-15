import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Eye, Pin } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useViews } from '@/hooks/use-views';
import { triggerHaptic } from '@/lib/haptics';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';

export function ViewsScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();
  const { data: views = [] } = useViews();

  const eyeIconColor = parseOklch(isDark ? 'oklch(0.72 0.14 240)' : 'oklch(0.52 0.14 240)');
  const eyeBgColor = parseOklch(isDark ? 'oklch(0.24 0.04 240)' : 'oklch(0.94 0.03 240)');

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-5 p-4 pb-28"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between pt-1">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 active:bg-accent"
        >
          <ArrowLeft size={16} className="text-foreground" />
          <Text className="text-xs font-semibold text-foreground">Back</Text>
        </Pressable>
        <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Perspectives
        </Text>
      </View>

      <View>
        <Text className="text-2xl font-extrabold tracking-tight text-foreground">Saved Views</Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          Reusable analytical query filters and visualization perspectives.
        </Text>
      </View>

      {/* Views List */}
      <View className="gap-3">
        {views.length === 0 ? (
          <View className="w-full items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8">
            <View
              style={{ backgroundColor: eyeBgColor }}
              className="h-12 w-12 items-center justify-center rounded-2xl"
            >
              <Eye size={22} color={eyeIconColor} />
            </View>
            <Text className="mt-3 text-base font-semibold text-foreground text-center">No Saved Views</Text>
            <Text className="mt-1 text-center text-xs text-muted-foreground px-4">
              Saved views allow you to bookmark complex transaction filters like "Tax Deductibles" or "Trip Expenses".
            </Text>
          </View>
        ) : (
          views.map((view) => (
            <Pressable
              key={String(view.id)}
              onPress={() => {
                triggerHaptic('selection');
                router.push(`/views/${String(view.id)}` as any);
              }}
              className="active:opacity-90"
            >
              <Card className="rounded-2xl border-border bg-card shadow-sm">
                <CardContent className="flex-row items-center justify-between p-4">
                  <View className="flex-1 flex-row items-center gap-3">
                    <View
                      style={{ backgroundColor: eyeBgColor }}
                      className="h-10 w-10 items-center justify-center rounded-xl"
                    >
                      <Eye size={18} color={eyeIconColor} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-bold text-foreground">{view.name}</Text>
                        {view.isPinned && <Pin size={12} color={eyeIconColor} />}
                      </View>
                      <Text className="text-xs text-muted-foreground">
                        Sort by {view.sort.field} ({view.sort.direction})
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </CardContent>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}
