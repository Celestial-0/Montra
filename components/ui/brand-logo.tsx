import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import { parseOklch } from '@/lib/oklch';
import { useAppTheme } from '@/lib/theme';

export interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  withFrame?: boolean;
}

/**
 * Montra Architectural Ribbon 'M' Logo
 * Symmetrical 3D folded 'M' with open legs, Deep Forest [oklch(0.274 0.046 145)] tile,
 * and faceted Ivory [oklch(0.972 0.008 75)] / Fog Gray [oklch(0.916 0.007 230)] ribbon planes.
 */
export function BrandLogo({
  size = 32,
  showWordmark = false,
  wordmarkClassName = 'text-base font-extrabold tracking-tight',
  withFrame = true,
}: BrandLogoProps) {
  const { isDark } = useAppTheme();

  const tileBg = parseOklch('oklch(0.274 0.046 145)');
  const tileBorder = parseOklch(isDark ? 'oklch(0.350 0.040 145)' : 'oklch(0.220 0.040 145)');
  const ivoryColor = parseOklch('oklch(0.972 0.008 75)');
  const fogColor = parseOklch('oklch(0.916 0.007 230)');
  const shadowFacetColor = parseOklch('oklch(0.840 0.008 230)');

  return (
    <View className="flex-row items-center gap-2.5">
      <Svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
      >
        {withFrame && (
          <Rect
            x="0.5"
            y="0.5"
            width="31"
            height="31"
            rx="9"
            fill={tileBg}
            stroke={tileBorder}
            strokeWidth="1"
          />
        )}

        {/* 1. Left Vertical Pillar Leg (Ivory Highlight) */}
        <Path
          d="M6.5 10.5L10.5 6.5V25L6.5 23V10.5Z"
          fill={ivoryColor}
        />

        {/* 2. Left-to-Center Downward Fold (Fog Gray Midtone) */}
        <Path
          d="M10.5 6.5L16 13V18L10.5 11.5V6.5Z"
          fill={fogColor}
        />

        {/* 3. Center-to-Right Upward Fold (Faceted Shadow) */}
        <Path
          d="M16 13L21.5 6.5V11.5L16 18V13Z"
          fill={shadowFacetColor}
        />

        {/* 4. Right Vertical Pillar Leg (Ivory Highlight) */}
        <Path
          d="M21.5 6.5L25.5 10.5V23L21.5 25V6.5Z"
          fill={ivoryColor}
        />
      </Svg>

      {showWordmark && (
        <View className="flex-row items-baseline gap-1">
          <Text className={`text-foreground ${wordmarkClassName}`}>
            MONTRA
          </Text>
          <View className="h-1.5 w-1.5 rounded-full bg-income" />
        </View>
      )}
    </View>
  );
}

export default BrandLogo;
