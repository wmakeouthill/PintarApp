import React from 'react';
import {Pressable, StyleSheet, Text, useWindowDimensions, View} from 'react-native';

import {colors, spacing, typography} from '@/core/theme';
import {ColoringTool} from '../models/coloringTypes';

type ToolboxProps = {
  activeTool: ColoringTool;
  onSelect: (tool: ColoringTool) => void;
  onReset: () => void;
};

const TOOL_LABELS: Record<ColoringTool, string> = {
  fill: 'Preencher',
  erase: 'Borracha',
  brush: 'Pincel',
  eyedropper: 'Conta-gotas',
};

export const Toolbox: React.FC<ToolboxProps> = ({
  activeTool,
  onSelect,
  onReset,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.caption}>Ferramentas</Text>
      <View style={styles.toolRow}>
        {(Object.keys(TOOL_LABELS) as ColoringTool[]).map(
          (tool, index) => {
            const isActive = tool === activeTool;
            // Every 2nd button (index 1, 3) should not have marginRight
            const isLastInRow = index % 2 === 1;
            return (
              <Pressable
                key={tool}
                style={[
                  styles.toolButton,
                  isLastInRow && styles.toolButtonLastInRow,
                  isActive && styles.toolButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityState={{selected: isActive}}
                onPress={() => onSelect(tool)}>
                <Text
                  style={[
                    styles.toolLabel,
                    isActive && styles.toolLabelActive,
                  ]}
                  numberOfLines={1}>
                  {TOOL_LABELS[tool]}
                </Text>
              </Pressable>
            );
          },
        )}
      </View>
      <Pressable style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetLabel}>Limpar Tudo</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: typography.subtitle,
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  toolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    width: '100%',
  },
  toolButton: {
    width: '48%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginBottom: spacing.md,
  },
  toolButtonLastInRow: {
    marginRight: 0,
  },
  toolButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  toolSpacing: {
    marginRight: 0,
  },
  toolLabel: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: typography.body * 1.2,
  },
  toolLabelActive: {
    color: colors.background,
    fontWeight: '600',
  },
  resetButton: {
    width: '100%',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  resetLabel: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});

