import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { ArrowLeftRight, ArrowUpRight, TrendingDown, Wallet } from 'lucide-react-native';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAccounts } from '@/hooks/use-accounts';
import { useCashFlow, useIncomeBreakdown, useSpendingBreakdown } from '@/hooks/use-analytics';
import { useCategories } from '@/hooks/use-categories';
import { formatMoney, formatPercentage } from '@/lib/format';
import { triggerHaptic } from '@/lib/haptics';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export const OKLCH_SPENDING_PALETTE = [
  'oklch(0.660 0.180 20)',   // Mindful Crimson
  'oklch(0.720 0.160 150)',  // Deep Forest Mint
  'oklch(0.680 0.080 230)',  // Soft Fog Slate
  'oklch(0.780 0.140 75)',   // Golden Amber
  'oklch(0.274 0.046 145)',  // Deep Forest
  'oklch(0.700 0.120 180)',  // Calm Teal
  'oklch(0.640 0.120 280)',  // Amethyst Slate
  'oklch(0.600 0.080 100)',  // Olive Mist
];

export const OKLCH_INCOME_PALETTE = [
  'oklch(0.720 0.160 150)',  // Deep Forest Mint
  'oklch(0.274 0.046 145)',  // Deep Forest
  'oklch(0.680 0.080 230)',  // Soft Fog Slate
  'oklch(0.780 0.140 75)',   // Golden Amber
  'oklch(0.700 0.120 180)',  // Calm Teal
  'oklch(0.640 0.120 280)',  // Amethyst Slate
  'oklch(0.660 0.180 20)',   // Crimson
  'oklch(0.600 0.080 100)',  // Olive Mist
];

export function SpendingHeroDonut() {
  const { isDark, colors } = useAppTheme();
  const [activeMode, setActiveMode] = useState<'expense' | 'income'>('expense');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts();
  const { data: cashFlow, isLoading: isLoadingCashFlow } = useCashFlow();
  const { data: expenseBreakdown = [], isLoading: isLoadingExpenses } = useSpendingBreakdown();
  const { data: incomeBreakdown = [], isLoading: isLoadingIncome } = useIncomeBreakdown();
  const { data: catData, isLoading: isLoadingCategories } = useCategories();

  const categories = catData?.categories ?? [];
  const categoryMap = new Map(categories.map((c) => [String(c.id), c]));

  // Active breakdown mode
  const isExpense = activeMode === 'expense';
  const currentBreakdown = isExpense ? expenseBreakdown : incomeBreakdown;
  const currentPalette = isExpense ? OKLCH_SPENDING_PALETTE : OKLCH_INCOME_PALETTE;
  const isLoading = isLoadingAccounts && isLoadingCashFlow && (isExpense ? isLoadingExpenses : isLoadingIncome);

  // Financial Stats
  const totalBalanceMinor = accounts.reduce((acc, account) => {
    if (!account.isActive) return acc;
    return acc + account.currentBalance.amount;
  }, 0);

  const totalIncomeMinor = cashFlow?.totalIncomeMinor ?? 0;
  const totalExpenseMinor = cashFlow?.totalExpenseMinor ?? 0;
  const currentTotalMinor = isExpense ? totalExpenseMinor : totalIncomeMinor;

  // Donut Dimensions (Copilot / Mobbin Style)
  const size = 184;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const toggleMode = () => {
    triggerHaptic('selection');
    setSelectedIndex(null);
    setActiveMode((prev) => (prev === 'expense' ? 'income' : 'expense'));
  };

  const handleSelectCategory = (index: number) => {
    triggerHaptic('selection');
    setSelectedIndex((prev) => (prev === index ? null : index));
  };

  // Selected category tooltip data
  const selectedItem =
    selectedIndex !== null && currentBreakdown && currentBreakdown[selectedIndex]
      ? currentBreakdown[selectedIndex]
      : null;

  const selectedColor = selectedItem
    ? categoryMap.get(selectedItem.categoryId)?.color ||
      currentPalette[selectedIndex! % currentPalette.length]
    : null;

  const selectedCatName = selectedItem
    ? categoryMap.get(selectedItem.categoryId)?.name ??
      ('categoryName' in selectedItem && typeof (selectedItem as any).categoryName === 'string'
        ? (selectedItem as any).categoryName
        : selectedItem.categoryId === 'uncategorized'
        ? 'Uncategorized'
        : 'Category')
    : null;

  // Compute segment geometry
  let accumulatedAngle = 0;
  const computedSegments = (currentBreakdown ?? []).map((item, index) => {
    const rawColor =
      categoryMap.get(item.categoryId)?.color ||
      currentPalette[index % currentPalette.length];
    const parsedColor = parseOklch(rawColor);
    const strokeDashoffset = circumference - (circumference * (item.percentage ?? 0)) / 100;
    const rotation = (accumulatedAngle / 100) * 360;
    accumulatedAngle += item.percentage ?? 0;
    return {
      ...item,
      parsedColor,
      strokeDashoffset,
      rotation,
      index,
    };
  });

  // Animated Loading Skeleton State
  if (isLoading) {
    return (
      <Card className="rounded-3xl border-border/80 bg-card shadow-sm overflow-hidden">
        <CardContent className="gap-3.5 p-5">
          {/* Skeleton Donut Ring */}
          <View className="items-center justify-center py-2">
            <View className="items-center justify-center relative" style={{ width: size, height: size }}>
              <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={parseOklch(isDark ? 'oklch(0.200 0.008 145)' : 'oklch(0.930 0.007 230)')}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
              </Svg>
              <View className="absolute items-center justify-center gap-1.5">
                <Skeleton className="h-2.5 w-16 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-lg" />
                <Skeleton className="h-2 w-14 rounded-full" />
              </View>
            </View>
          </View>

          {/* Skeleton Category Chips */}
          <View className="flex-row gap-2 px-0.5 py-1">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </View>

          {/* Skeleton Bottom Cards */}
          <View className="flex-row gap-3 border-t border-border/60 pt-3">
            <Skeleton className="flex-1 h-14 rounded-2xl" />
            <Skeleton className="flex-1 h-14 rounded-2xl" />
          </View>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-border/80 bg-card shadow-sm overflow-hidden">
      <CardContent className="gap-3.5 p-5">
        {/* Donut Visualization with Floating Dynamic Center Tooltip */}
        <View className="items-center justify-center py-2">
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <G transform={`rotate(-90 ${center} ${center})`}>
              {/* Background Track Ring */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={parseOklch(isDark ? 'oklch(0.220 0.008 145)' : 'oklch(0.940 0.007 230)')}
                strokeWidth={strokeWidth}
                fill="none"
              />

              {/* Colored Category Segments */}
              {computedSegments.map((seg) => {
                const isThisSelected = selectedIndex === seg.index;
                const isAnySelected = selectedIndex !== null;

                return (
                  <Circle
                    key={seg.categoryId}
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={seg.parsedColor}
                    strokeWidth={isThisSelected ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={seg.strokeDashoffset}
                    fill="none"
                    strokeLinecap="round"
                    transform={`rotate(${seg.rotation} ${center} ${center})`}
                    opacity={isAnySelected && !isThisSelected ? 0.3 : 1}
                  />
                );
              })}
            </G>
          </Svg>

          {/* Centered Floating Metric Overlay */}
          <Pressable
            onPress={() => selectedIndex !== null && setSelectedIndex(null)}
            className="absolute items-center justify-center max-w-[130px]"
          >
            {selectedItem ? (
              <View className="items-center">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                  <View
                    style={{ backgroundColor: parseOklch(selectedColor!) }}
                    className="h-2 w-2 rounded-full"
                  />
                  <Text
                    className="text-[11px] font-semibold text-foreground text-center"
                    numberOfLines={1}
                  >
                    {selectedCatName}
                  </Text>
                </View>
                <Text
                  className={cn(
                    'text-xl font-extrabold tracking-tight',
                    isExpense ? 'text-foreground' : 'text-income'
                  )}
                  numberOfLines={1}
                >
                  {isExpense ? '' : '+'}
                  {formatMoney(selectedItem.amountMinor)}
                </Text>
                <View className="rounded-full bg-secondary/80 px-2 py-0.5 mt-1 border border-border/60">
                  <Text className="text-[10px] font-bold text-muted-foreground">
                    {formatPercentage(selectedItem.percentage)}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {isExpense ? 'Total Spent' : 'Total Income'}
                </Text>
                <Text
                  className={cn(
                    'text-2xl font-extrabold tracking-tight',
                    isExpense ? 'text-foreground' : 'text-income'
                  )}
                  numberOfLines={1}
                >
                  {isExpense ? '' : '+'}
                  {formatMoney(currentTotalMinor)}
                </Text>
                <Text className="text-[10px] font-medium text-muted-foreground mt-0.5">
                  {(currentBreakdown ?? []).length > 0 ? 'This Month' : 'No records yet'}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Horizontal Category Pill Carousel */}
        {(currentBreakdown ?? []).length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-0.5 py-1"
          >
            {currentBreakdown.map((item, index) => {
              const isSelected = selectedIndex === index;
              const rawColor =
                categoryMap.get(item.categoryId)?.color ||
                currentPalette[index % currentPalette.length];
              const parsedColor = parseOklch(rawColor);

              const catName =
                categoryMap.get(item.categoryId)?.name ??
                ('categoryName' in item && typeof (item as any).categoryName === 'string'
                  ? (item as any).categoryName
                  : item.categoryId === 'uncategorized'
                  ? 'Uncategorized'
                  : 'Category');

              return (
                <Pressable
                  key={item.categoryId}
                  onPress={() => handleSelectCategory(index)}
                  className={cn(
                    'flex-row items-center gap-1.5 rounded-full px-3 py-1.5 border active:scale-[0.96]',
                    isSelected
                      ? 'border-foreground bg-foreground/10 shadow-xs'
                      : 'border-border/70 bg-secondary/50 active:bg-secondary'
                  )}
                >
                  <View style={{ backgroundColor: parsedColor }} className="h-2 w-2 rounded-full" />
                  <Text
                    className={cn(
                      'text-xs font-semibold',
                      isSelected ? 'text-foreground font-bold' : 'text-muted-foreground'
                    )}
                  >
                    {catName}
                  </Text>
                  <Text className="text-[10px] font-medium text-muted-foreground/80">
                    {formatPercentage(item.percentage)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View className="items-center py-1">
            <Text className="text-xs text-muted-foreground text-center">
              {isExpense
                ? 'No expenses recorded this month yet.'
                : 'No income recorded this month yet.'}
            </Text>
          </View>
        )}

        {/* Bottom Split Cards: Net Worth & Interactive Mode Switcher */}
        <View className="flex-row gap-3 border-t border-border/60 pt-3">
          {/* Left: Net Worth Card */}
          <View className="flex-1 rounded-2xl border border-border/70 bg-secondary/40 p-3.5">
            <View className="flex-row items-center gap-2.5">
              <View className="rounded-xl bg-primary/10 p-2 border border-primary/15">
                <Wallet size={15} color={colors.primary} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Net Worth
                </Text>
                <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                  {formatMoney(totalBalanceMinor)}
                </Text>
              </View>
            </View>
          </View>

          {/* Right: Interactive Mode Switch Button Card */}
          <Pressable
            onPress={toggleMode}
            className={cn(
              'flex-1 rounded-2xl border p-3.5 active:scale-[0.97]',
              isExpense
                ? 'border-income/30 bg-income-muted/20 active:bg-income-muted/35'
                : 'border-destructive/30 bg-destructive/10 active:bg-destructive/20'
            )}
          >
            <View className="flex-row items-center gap-2.5">
              <View
                className={cn(
                  'rounded-xl p-2 border',
                  isExpense
                    ? 'bg-income-muted/50 border-income/30'
                    : 'bg-destructive/20 border-destructive/30'
                )}
              >
                {isExpense ? (
                  <ArrowUpRight size={15} color={colors.income} />
                ) : (
                  <TrendingDown size={15} color={colors.destructive} />
                )}
              </View>
              <View className="flex-1 min-w-0">
                <View className="flex-row items-center justify-between">
                  <Text
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wider',
                      isExpense ? 'text-income' : 'text-destructive'
                    )}
                  >
                    {isExpense ? 'Income MTD' : 'Spent MTD'}
                  </Text>
                  <ArrowLeftRight size={10} color={isExpense ? colors.income : colors.destructive} />
                </View>
                <Text
                  className={cn(
                    'text-xs font-bold',
                    isExpense ? 'text-income' : 'text-destructive'
                  )}
                  numberOfLines={1}
                >
                  {isExpense ? '+' : '-'}
                  {formatMoney(isExpense ? totalIncomeMinor : totalExpenseMinor)}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </CardContent>
    </Card>
  );
}