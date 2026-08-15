import React from 'react';
import { View } from 'react-native';
import { Activity, Calendar } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTransactionVolume } from '@/hooks/use-analytics';
import { formatDateShort, formatMoney } from '@/lib/format';
import { useAppTheme } from '@/lib/theme';

export interface CategoryTrendChartProps {
  startDate?: string;
  endDate?: string;
}

export function CategoryTrendChart({ startDate, endDate }: CategoryTrendChartProps) {
  const { isDark } = useAppTheme();
  const { data: volumeData } = useTransactionVolume(startDate, endDate);

  const series = volumeData?.dailySeries ?? [];
  const totalCount = volumeData?.totalCount ?? 0;
  const averageAmountMinor = volumeData?.averageAmountMinor ?? 0;

  const maxDailyAmount = Math.max(...series.map((s) => s.amountMinor), 1);

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Daily Spending Velocity
        </CardTitle>
        <View className="flex-row items-center gap-1">
          <Activity size={14} color={isDark ? '#f8fafc' : '#0f172a'} />
          <Text className="text-xs font-bold text-foreground">
            {totalCount} transactions
          </Text>
        </View>
      </CardHeader>

      <CardContent className="gap-4 p-5">
        {series.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-xs text-muted-foreground">No transaction data in this period.</Text>
          </View>
        ) : (
          <View className="gap-3">
            {/* Sparkline / Bar timeline */}
            <View className="h-28 flex-row items-end gap-1.5 rounded-xl bg-secondary/30 p-3 border border-border/40">
              {series.slice(-14).map((day) => {
                const heightPercent = Math.max(
                  Math.round((day.amountMinor / maxDailyAmount) * 100),
                  8
                );
                return (
                  <View key={day.date} className="flex-1 items-center justify-end h-full">
                    <View
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-t-sm bg-primary/70 active:bg-primary"
                    />
                  </View>
                );
              })}
            </View>

            {/* Averages info */}
            <View className="flex-row items-center justify-between border-t border-border/60 pt-3">
              <View className="flex-row items-center gap-1.5">
                <Calendar size={13} color={isDark ? '#a1a1aa' : '#64748b'} />
                <Text className="text-xs text-muted-foreground">Daily Average</Text>
              </View>
              <Text className="text-xs font-bold text-foreground">
                {formatMoney(averageAmountMinor)} / day
              </Text>
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
