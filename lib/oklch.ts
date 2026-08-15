/**
 * W3C CSS Color Module Level 4 — OKLCH Color Space Parser for React Native
 * Converts oklch(L C H [/ A]) strings to standard sRGB hex or rgba format so React Native
 * native bridges (Android ColorPropConverter / iOS RCTConvert) can render them natively.
 */

export function oklchToRgb(
  l: number,
  c: number,
  h: number,
  alpha = 1
): { r: number; g: number; b: number; a: number; hex: string; rgba: string } {
  // Normalize Lightness (accept 0-1 or 0-100%)
  const L = l > 1 ? l / 100 : Math.max(0, Math.min(1, l));
  const C = Math.max(0, c);
  const H = ((h % 360) + 360) % 360;

  // Convert OKLCH to OKLab
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // OKLab to linear LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const lCube = l_ * l_ * l_;
  const mCube = m_ * m_ * m_;
  const sCube = s_ * s_ * s_;

  // Linear LMS to linear sRGB
  const rLinear = +4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube;
  const gLinear = -1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube;
  const bLinear = -0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube;

  // Transfer function (linear sRGB -> sRGB gamma curve)
  const gamma = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const r = Math.round(gamma(rLinear) * 255);
  const g = Math.round(gamma(gLinear) * 255);
  const bVal = Math.round(gamma(bLinear) * 255);
  const aVal = Math.max(0, Math.min(1, alpha));

  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = bVal.toString(16).padStart(2, '0');
  const hex = `#${hexR}${hexG}${hexB}`;
  const rgba = `rgba(${r}, ${g}, ${bVal}, ${aVal})`;

  return { r, g: g, b: bVal, a: aVal, hex, rgba };
}

/**
 * Parses any color string. If it is in oklch format (e.g. "oklch(0.70 0.20 148)" or "oklch(70% 0.2 148 / 0.5)"),
 * converts it to a standard hex or rgba string that React Native native engines parse without warnings.
 */
export function parseOklch(color: string | undefined | null): string {
  if (!color || typeof color !== 'string') return color ?? '';

  const trimmed = color.trim();

  // Match oklch(L C H) or oklch(L C H / A) with commas or spaces
  const oklchMatch = trimmed.match(
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*[\/\,]\s*([\d.]+%?))?\s*\)$/i
  );

  if (!oklchMatch) {
    return trimmed;
  }

  const lRaw = oklchMatch[1];
  const cRaw = oklchMatch[2];
  const hRaw = oklchMatch[3];
  const aRaw = oklchMatch[4];

  const l = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
  const c = parseFloat(cRaw);
  const h = parseFloat(hRaw);
  const alpha = aRaw
    ? aRaw.endsWith('%')
      ? parseFloat(aRaw) / 100
      : parseFloat(aRaw)
    : 1;

  const result = oklchToRgb(l, c, h, alpha);
  return alpha < 1 ? result.rgba : result.hex;
}

/**
 * Transforms an entire object containing OKLCH color values into native-parsed color values.
 */
export function parseThemeOklch<T extends Record<string, any>>(theme: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(theme)) {
    if (typeof value === 'string' && value.startsWith('oklch(')) {
      result[key] = parseOklch(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = parseThemeOklch(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
