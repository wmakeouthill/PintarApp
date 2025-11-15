import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Slider from '@react-native-community/slider';

import {colors, spacing, typography} from '@/core/theme';

type BrushWidthSliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  visible: boolean;
};

export const BrushWidthSlider: React.FC<BrushWidthSliderProps> = ({
  value,
  onValueChange,
  visible,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Espessura: {Math.round(value)}px</Text>
      <Slider
        style={styles.slider}
        minimumValue={2}
        maximumValue={30}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.body,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

