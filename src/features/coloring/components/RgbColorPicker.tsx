import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import Slider from '@react-native-community/slider';

import {colors, spacing, typography} from '@/core/theme';

type RgbColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
};

type RGB = {
  r: number;
  g: number;
  b: number;
};

const hexToRgb = (hex: string): RGB => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : {r: 0, g: 0, b: 0};
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const RgbColorPicker: React.FC<RgbColorPickerProps> = ({value, onChange}) => {
  const [rgb, setRgb] = useState<RGB>(hexToRgb(value));
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  useEffect(() => {
    const newRgb = hexToRgb(value);
    setRgb(newRgb);
    const hsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [value]);

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {h: h * 360, s: s * 100, l: l * 100};
  };

  const hslToRgb = (h: number, s: number, l: number): RGB => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  const handleRgbChange = useCallback(
    (component: 'r' | 'g' | 'b', newValue: string) => {
      const numValue = clamp(parseInt(newValue, 10) || 0, 0, 255);
      const newRgb = {...rgb, [component]: numValue};
      setRgb(newRgb);
      onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [rgb, onChange],
  );

  const handleHueChange = useCallback(
    (newHue: number) => {
      const clampedHue = clamp(newHue, 0, 360);
      setHue(clampedHue);
      const newRgb = hslToRgb(clampedHue, saturation, lightness);
      setRgb(newRgb);
      onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [saturation, lightness, onChange],
  );

  const handleSaturationChange = useCallback(
    (newSat: number) => {
      const clampedSat = clamp(newSat, 0, 100);
      setSaturation(clampedSat);
      const newRgb = hslToRgb(hue, clampedSat, lightness);
      setRgb(newRgb);
      onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [hue, lightness, onChange],
  );

  const handleLightnessChange = useCallback(
    (newLight: number) => {
      const clampedLight = clamp(newLight, 0, 100);
      setLightness(clampedLight);
      const newRgb = hslToRgb(hue, saturation, clampedLight);
      setRgb(newRgb);
      onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    },
    [hue, saturation, onChange],
  );

  const hueColors = useMemo(() => {
    const colors: string[] = [];
    for (let i = 0; i <= 360; i += 30) {
      const rgb = hslToRgb(i, 100, 50);
      colors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
    }
    return colors;
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        <View style={[styles.previewBox, {backgroundColor: value}]} />
        <Text style={styles.hexValue}>{value}</Text>
      </View>

      <View style={styles.rgbRow}>
        <View style={styles.rgbInput}>
          <Text style={styles.label}>R</Text>
          <TextInput
            style={styles.input}
            value={rgb.r.toString()}
            onChangeText={v => handleRgbChange('r', v)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        <View style={styles.rgbInput}>
          <Text style={styles.label}>G</Text>
          <TextInput
            style={styles.input}
            value={rgb.g.toString()}
            onChangeText={v => handleRgbChange('g', v)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
        <View style={styles.rgbInput}>
          <Text style={styles.label}>B</Text>
          <TextInput
            style={styles.input}
            value={rgb.b.toString()}
            onChangeText={v => handleRgbChange('b', v)}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      </View>

      <View style={styles.hueBar}>
        {hueColors.map((color, idx) => (
          <Pressable
            key={idx}
            style={[styles.hueSwatch, {backgroundColor: color}]}
            onPress={() => handleHueChange(idx * 30)}
          />
        ))}
      </View>

      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>Saturação: {Math.round(saturation)}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={saturation}
          onValueChange={handleSaturationChange}
          minimumTrackTintColor={rgbToHex(
            hslToRgb(hue, 100, lightness).r,
            hslToRgb(hue, 100, lightness).g,
            hslToRgb(hue, 100, lightness).b,
          )}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
      </View>

      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>Brilho: {Math.round(lightness)}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={lightness}
          onValueChange={handleLightnessChange}
          minimumTrackTintColor={rgbToHex(
            hslToRgb(hue, saturation, 50).r,
            hslToRgb(hue, saturation, 50).g,
            hslToRgb(hue, saturation, 50).b,
          )}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    padding: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.sm,
  },
  previewBox: {
    width: 32,
    height: 32,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  hexValue: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  rgbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rgbInput: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.xs,
    padding: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.caption,
    textAlign: 'center',
  },
  hueBar: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    height: 24,
    borderRadius: spacing.xs,
    overflow: 'hidden',
  },
  hueSwatch: {
    flex: 1,
    height: '100%',
  },
  sliderRow: {
    marginBottom: spacing.sm,
  },
  sliderLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 30,
  },
});

