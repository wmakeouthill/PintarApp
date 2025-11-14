import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';

import {colors as themeColors, palette, spacing, typography} from '@/core/theme';

type ColorPaletteProps = {
  swatches: string[];
  selected: string;
  onSelect: (hex: string) => void;
};

export const ColorPalette: React.FC<ColorPaletteProps> = props => {
  const {swatches, selected, onSelect} = props;
  const total = swatches.length;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cores sugeridas</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={swatches}
        keyExtractor={hex => hex}
        contentContainerStyle={styles.listContent}
        renderItem={({item: hex, index}) => {
          const isActive = hex === selected;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Selecionar cor ${hex}`}
              onPress={() => onSelect(hex)}
              style={[
                styles.swatch,
                {backgroundColor: hex},
                index < total - 1 && styles.swatchSpacing,
              ]}>
              {isActive ? <View style={styles.activeOutline} /> : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const SWATCH_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  label: {
    color: themeColors.textSecondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  listContent: {},
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: themeColors.surfaceAlt,
  },
  swatchSpacing: {
    marginRight: spacing.md,
  },
  activeOutline: {
    width: SWATCH_SIZE - 16,
    height: SWATCH_SIZE - 16,
    borderRadius: (SWATCH_SIZE - 16) / 2,
    borderWidth: 2,
    borderColor: palette.white,
  },
});

