import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { PieChart as PieIcon } from 'lucide-react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useSpendingBreakdown } from '@/hooks/use-analytics';
import { useCategories } from '@/hooks/use-categories';
import { formatMoney, formatPercentage } from '@/lib/format';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';

export const OKLCH_CHART_PALETTE = [
  'oklch(0.74 0.12 145)', // Sage Mineral
  'oklch(0.76 0.12 75)',  // Warm Ochre
  'oklch(0.68 0.13 35)',  // Smoked Terracotta
  'oklch(0.70 0.04 220)', // Titanium Slate
  'oklch(0.70 0.10 115)', // Antique Olive
  'oklch(0.66 0.09 50)',  // Clay Bronze
  'oklch(0.78 0.08 90)',  // Warm Sand
  'oklch(0.60 0.10 160)', // Deep Pine
];

export interface SpendingDonutChartProps {
  startDate?: string;
  endDate?: string;
}

export function SpendingDonutChart({ startDate, endDate }: SpendingDonutChartProps) {
  const { isDark, colors } = useAppTheme();
  const { data: breakdown = [] } = useSpendingBreakdown(startDate, endDate);
  const { data: catData } = useCategories();
  const categories = catData?.categories ?? [];
  const categoryMap = new Map(categories.map((c) => [String(c.id), c]));

  const totalSpentMinor = breakdown.reduce((sum, item) => sum + item.amountMinor, 0);

  if (breakdown.length === 0) {
    return (
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="items-center justify-center py-10">
          <View className="rounded-full bg-secondary/80 p-3">
            <PieIcon size={22} color={colors.foreground} />
          </View>
          <Text className="mt-2.5 text-sm font-medium text-foreground">No Expense Data</Text>
          <Text className="text-xs text-muted-foreground">
            No expenses recorded for this time period.
          </Text>
        </CardContent>
      </Card>
    );
  }

  // SVG Donut calculations
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercent = 0;

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Spending Breakdown
        </CardTitle>
        <Text className="text-xs font-bold text-foreground">
          {formatMoney(totalSpentMinor)} Total
        </Text>
      </CardHeader>

      <CardContent className="gap-5 p-5">
        {/* Donut Graphic */}
        <View className="items-center justify-center">
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G transform={`rotate(-90 ${center} ${center})`}>
              {/* Background ring */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={parseOklch(isDark ? 'oklch(0.22 0.005 60)' : 'oklch(0.92 0.004 80)')}
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.5}
              />
              {/* Colored Segments */}
              {breakdown.map((item, index) => {
                const rawColor =
                  categoryMap.get(item.categoryId)?.color ||
                  OKLCH_CHART_PALETTE[index % OKLCH_CHART_PALETTE.length];
                const parsedColor = parseOklch(rawColor);
                const strokeDashoffset = circumference - (circumference * item.percentage) / 100;
                const rotation = (accumulatedPercent / 100) * 360;
                accumulatedPercent += item.percentage;

                return (
                  <Circle
                    key={item.categoryId}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={parsedColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    fill="none"
                    strokeLinecap="round"
                    transform={`rotate(${rotation} ${center} ${center})`}
                  />
                );
              })}
            </G>
          </Svg>

          {/* Center Info Overlay */}
          <View className="absolute items-center justify-center">
            <Text className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Spent
            </Text>
            <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
              {formatMoney(totalSpentMinor)}
            </Text>
          </View>
        </View>

        {/* Category Legend List */}
        <View className="gap-2.5 border-t border-border/60 pt-3">
          {breakdown.map((item, index) => {
            const rawColor =
              categoryMap.get(item.categoryId)?.color ||
              OKLCH_CHART_PALETTE[index % OKLCH_CHART_PALETTE.length];
            const parsedColor = parseOklch(rawColor);

            return (
              <View key={item.categoryId} className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-2.5 pr-2">
                  <View style={{ backgroundColor: parsedColor }} className="h-2.5 w-2.5 rounded-full" />
                  <Text className="text-xs font-semibold text-foreground" numberOfLines={1}>
                    {item.categoryName}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground">
                    ({formatPercentage(item.percentage)})
                  </Text>
                </View>
                <Text className="text-xs font-bold text-foreground">
                  {formatMoney(item.amountMinor)}
                </Text>
              </View>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}
