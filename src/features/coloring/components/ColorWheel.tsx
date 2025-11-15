import React, {useCallback, useMemo, useRef, useState} from 'react';
import {PanResponder, StyleSheet, View} from 'react-native';
import Svg, {Circle, Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';

import {colors, spacing} from '@/core/theme';

type ColorWheelProps = {
  size: number;
  value: string;
  onChange: (hex: string) => void;
};

const hexToHsl = (hex: string): {h: number; s: number; l: number} => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

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

const hslToHex = (h: number, s: number, l: number): string => {
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

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const createWheelPath = (
  center: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string => {
  const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
  const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = center + Math.cos(startAngleRad) * innerRadius;
  const y1 = center + Math.sin(startAngleRad) * innerRadius;
  const x2 = center + Math.cos(startAngleRad) * outerRadius;
  const y2 = center + Math.sin(startAngleRad) * outerRadius;
  const x3 = center + Math.cos(endAngleRad) * outerRadius;
  const y3 = center + Math.sin(endAngleRad) * outerRadius;
  const x4 = center + Math.cos(endAngleRad) * innerRadius;
  const y4 = center + Math.sin(endAngleRad) * innerRadius;

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
};

const SLIDER_HEIGHT = 200;
const SLIDER_WIDTH = 30;

export const ColorWheel: React.FC<ColorWheelProps> = ({size, value, onChange}) => {
  if (!size || size <= 0) {
    return null;
  }

  // Normalizar valor hex para garantir que está no formato correto
  const normalizedValue = value && value.startsWith('#') ? value : `#${value || 'FFFFFF'}`;

  const center = size / 2;
  const radius = size / 2 - 10;
  const innerRadius = 0;

  const hsl = useMemo(() => hexToHsl(normalizedValue), [normalizedValue]);
  const [hue, setHue] = useState(hsl.h);
  const [saturation, setSaturation] = useState(hsl.s);
  const [lightness, setLightness] = useState(hsl.l);

  React.useEffect(() => {
    const newHsl = hexToHsl(normalizedValue);
    setHue(newHsl.h);
    setSaturation(newHsl.s);
    setLightness(newHsl.l);
  }, [normalizedValue]);

  const getColorAtPosition = useCallback(
    (x: number, y: number): {h: number; s: number} => {
      const dx = x - center;
      const dy = y - center;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > radius) {
        return {h: hue, s: saturation};
      }

      let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      angle = (angle + 90 + 360) % 360;

      const s = Math.min(100, (distance / radius) * 100);

      return {h: angle, s};
    },
    [center, radius, hue, saturation],
  );

  const handleWheelChange = useCallback(
    (x: number, y: number) => {
      const {h, s} = getColorAtPosition(x, y);
      setHue(h);
      setSaturation(s);
      const newHex = hslToHex(h, s, lightness);
      onChange(newHex);
    },
    [getColorAtPosition, lightness, onChange],
  );

  const handleLightnessChange = useCallback(
    (newLightness: number) => {
      setLightness(newLightness);
      const newHex = hslToHex(hue, saturation, newLightness);
      onChange(newHex);
    },
    [hue, saturation, onChange],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          const {locationX, locationY} = evt.nativeEvent;
          handleWheelChange(locationX, locationY);
        },
        onPanResponderMove: evt => {
          const {locationX, locationY} = evt.nativeEvent;
          handleWheelChange(locationX, locationY);
        },
      }),
    [handleWheelChange],
  );

  const segments = useMemo(() => {
    const segmentCount = 72;
    const segmentsArray = [];
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (i * 360) / segmentCount;
      const endAngle = ((i + 1) * 360) / segmentCount;
      const midAngle = (startAngle + endAngle) / 2;
      const color = hslToHex(midAngle, 100, 50);
      const path = createWheelPath(center, innerRadius, radius, startAngle, endAngle);
      segmentsArray.push({path, color, startAngle, endAngle});
    }
    return segmentsArray;
  }, [center, innerRadius, radius]);

  const currentAngle = (hue * Math.PI) / 180;
  const currentDistance = (radius * saturation) / 100;
  const selectorX = center + Math.cos(currentAngle - Math.PI / 2) * currentDistance;
  const selectorY = center + Math.sin(currentAngle - Math.PI / 2) * currentDistance;

  const lightnessGradientColors = [
    hslToHex(hue, saturation, 100),
    hslToHex(hue, saturation, 50),
    hslToHex(hue, saturation, 0),
  ];

  const lightnessSliderResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          const {locationY} = evt.nativeEvent;
          const newLightness = Math.max(0, Math.min(100, 100 - (locationY / SLIDER_HEIGHT) * 100));
          handleLightnessChange(newLightness);
        },
        onPanResponderMove: evt => {
          const {locationY} = evt.nativeEvent;
          const newLightness = Math.max(0, Math.min(100, 100 - (locationY / SLIDER_HEIGHT) * 100));
          handleLightnessChange(newLightness);
        },
      }),
    [handleLightnessChange],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.wheelContainer, {width: size, height: size}]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((segment, idx) => (
            <Path
              key={idx}
              d={segment.path}
              fill={segment.color}
              stroke={colors.surfaceAlt}
              strokeWidth="0.5"
            />
          ))}

          <Circle
            cx={selectorX}
            cy={selectorY}
            r="10"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          <Circle
            cx={selectorX}
            cy={selectorY}
            r="7"
            fill={normalizedValue}
            stroke="#000000"
            strokeWidth="2"
          />
        </Svg>
        <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
      </View>

      <View style={[styles.lightnessSliderContainer, {height: SLIDER_HEIGHT, width: SLIDER_WIDTH + 10}]}>
        <Svg width={SLIDER_WIDTH} height={SLIDER_HEIGHT} style={styles.sliderSvg}>
          <Defs>
            <LinearGradient id="lightnessSliderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={lightnessGradientColors[0]} stopOpacity="1" />
              <Stop offset="50%" stopColor={lightnessGradientColors[1]} stopOpacity="1" />
              <Stop offset="100%" stopColor={lightnessGradientColors[2]} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect
            x={SLIDER_WIDTH / 2 - SLIDER_WIDTH / 4}
            y={0}
            width={SLIDER_WIDTH / 2}
            height={SLIDER_HEIGHT}
            rx="4"
            ry="4"
            fill="url(#lightnessSliderGradient)"
            stroke={colors.border}
            strokeWidth="2"
          />
          <Circle
            cx={SLIDER_WIDTH / 2}
            cy={(100 - lightness) / 100 * SLIDER_HEIGHT}
            r="8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          <Circle
            cx={SLIDER_WIDTH / 2}
            cy={(100 - lightness) / 100 * SLIDER_HEIGHT}
            r="6"
            fill={colors.accent}
            stroke="#000000"
            strokeWidth="1"
          />
        </Svg>
        <View 
          style={[StyleSheet.absoluteFill, {width: SLIDER_WIDTH + 10}]}
          {...lightnessSliderResponder.panHandlers}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightnessSliderContainer: {
    height: 200,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sliderSvg: {
    position: 'absolute',
  },
});
