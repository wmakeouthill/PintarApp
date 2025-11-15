import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';

import {colors as themeColors, palette, spacing, typography} from '@/core/theme';

type ColorPaletteProps = {
  swatches: string[];
  selected: string;
  onSelect: (hex: string) => void;
  customSwatches?: string[];
  onOpenAdvanced?: () => void;
};

export const ColorPalette: React.FC<ColorPaletteProps> = props => {
  const {swatches, selected, onSelect, customSwatches = [], onOpenAdvanced} =
    props;
  const total = swatches.length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
          Cores sugeridas
        </Text>
        {onOpenAdvanced ? (
          <Pressable
            onPress={onOpenAdvanced}
            style={styles.actionButton}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Text style={styles.actionLink} numberOfLines={1}>
              Paleta avançada
            </Text>
          </Pressable>
        ) : null}
      </View>
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
      {customSwatches.length ? (
        <>
          <Text style={[styles.label, styles.customLabel]}>
            Minhas cores
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={customSwatches}
            keyExtractor={hex => `custom-${hex}`}
            contentContainerStyle={styles.listContent}
            renderItem={({item: hex, index}) => {
              const isActive = hex === selected;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar cor personalizada ${hex}`}
                  onPress={() => onSelect(hex)}
                  style={[
                    styles.swatch,
                    {backgroundColor: hex},
                    index < customSwatches.length - 1 && styles.swatchSpacing,
                  ]}>
                  {isActive ? <View style={styles.activeOutline} /> : null}
                </Pressable>
              );
            }}
          />
        </>
      ) : null}
    </View>
  );
};

const SWATCH_SIZE = 32;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  label: {
    color: themeColors.textSecondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
    marginRight: spacing.sm,
  },
  customLabel: {
    marginTop: spacing.md,
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
  actionButton: {
    flexShrink: 0,
  },
  actionLink: {
    color: themeColors.accent,
    fontWeight: '600',
    fontSize: typography.caption,
  },
});

