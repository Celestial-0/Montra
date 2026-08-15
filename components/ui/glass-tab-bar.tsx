import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Landmark, PieChart, Receipt, Settings } from 'lucide-react-native';
import { triggerHaptic } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';

const TAB_ICONS: Record<string, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  index: Home,
  transactions: Receipt,
  budget: PieChart,
  accounts: Landmark,
  more: Settings,
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  transactions: 'Transactions',
  budget: 'Budget',
  accounts: 'Accounts',
  more: 'More',
};

// Ultra-smooth Liquid Glass Spring Physics
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 180,
  mass: 0.6,
};

const PRESS_SPRING = {
  damping: 18,
  stiffness: 320,
};

const HORIZONTAL_PADDING = 6;
const PILL_MARGIN = 3;

interface TabButtonProps {
  route: BottomTabBarProps['state']['routes'][number];
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  isDark: boolean;
  primaryColor: string;
}

function TabButton({
  route,
  isFocused,
  onPress,
  onLongPress,
  isDark,
  primaryColor,
}: TabButtonProps) {
  const Icon = TAB_ICONS[route.name] ?? Home;
  const scale = useSharedValue(1);

  const iconColor = isFocused
    ? primaryColor
    : isDark
    ? 'rgba(255, 255, 255, 0.45)'
    : 'rgba(18, 18, 18, 0.45)';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.88, PRESS_SPRING);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, PRESS_SPRING);
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={TAB_LABELS[route.name] ?? route.name}
      className="flex-1 items-center justify-center py-2.5"
    >
      <Animated.View style={animatedStyle} className="items-center justify-center">
        <Icon
          size={23}
          color={iconColor}
          strokeWidth={isFocused ? 2.4 : 1.8}
        />
      </Animated.View>
    </Pressable>
  );
}

export function GlassFloatingTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const { isDark, colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [containerWidth, setContainerWidth] = useState(0);

  const activeIndex = state.index;
  const numTabs = state.routes.length;

  // Symmetrical geometry: subtract outer horizontal padding first
  const usableWidth = Math.max(0, containerWidth - 2 * HORIZONTAL_PADDING);
  const tabWidth = numTabs > 0 ? usableWidth / numTabs : 0;
  const pillWidth = Math.max(0, tabWidth - 2 * PILL_MARGIN);

  // Active pill sliding transition
  const pillTranslateX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      const targetX = HORIZONTAL_PADDING + activeIndex * tabWidth + PILL_MARGIN;
      pillTranslateX.value = withSpring(targetX, SPRING_CONFIG);
    }
  }, [activeIndex, tabWidth]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width !== containerWidth) {
      setContainerWidth(width);
      const newUsable = Math.max(0, width - 2 * HORIZONTAL_PADDING);
      const newTabWidth = numTabs > 0 ? newUsable / numTabs : 0;
      pillTranslateX.value = HORIZONTAL_PADDING + activeIndex * newTabWidth + PILL_MARGIN;
    }
  };

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: pillTranslateX.value }],
      width: pillWidth,
    };
  });

  const bottomPosition = Math.max(insets.bottom > 0 ? insets.bottom : 12, 16);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: bottomPosition },
      ]}
    >
      <View
        onLayout={onLayout}
        style={[
          styles.container,
          {
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        {/* 1. Native Cross-Platform Frosted Glass Blur */}
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={85}
          style={StyleSheet.absoluteFill}
        />

        {/* 2. Telegram / Liquid Translucent Glass Tint Overlay */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark
                ? 'rgba(18, 18, 18, 0.72)'
                : 'rgba(250, 245, 240, 0.76)',
            },
          ]}
        />

        {/* 3. Reanimated Sliding Active Tab Pill Glider */}
        {containerWidth > 0 && pillWidth > 0 && (
          <Animated.View
            style={[
              styles.pillGlider,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(22, 43, 29, 0.10)',
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.14)'
                  : 'rgba(22, 43, 29, 0.12)',
              },
              pillAnimatedStyle,
            ]}
          />
        )}

        {/* 4. Tab Icon Buttons - Symmetrically Padded */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            paddingHorizontal: HORIZONTAL_PADDING,
          }}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              triggerHaptic('selection');
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              triggerHaptic('impact');
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabButton
                key={route.key}
                route={route}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                isDark={isDark}
                primaryColor={colors.primary}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 50,
  },
  container: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillGlider: {
    position: 'absolute',
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    top: 6,
  },
});
