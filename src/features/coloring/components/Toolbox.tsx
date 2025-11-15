import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

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
          (tool, index, arr) => {
            const isActive = tool === activeTool;
            return (
              <Pressable
                key={tool}
                style={[
                  styles.toolButton,
                  isActive && styles.toolButtonActive,
                  index < arr.length - 1 && styles.toolSpacing,
                ]}
                accessibilityRole="button"
                accessibilityState={{selected: isActive}}
                onPress={() => onSelect(tool)}>
                <Text
                  style={[
                    styles.toolLabel,
                    isActive && styles.toolLabelActive,
                  ]}>
                  {TOOL_LABELS[tool]}
                </Text>
              </Pressable>
            );
          },
        )}
        <Pressable style={[styles.resetButton]} onPress={onReset}>
          <Text style={styles.resetLabel}>Limpar</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  toolButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
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
    fontSize: typography.caption,
    fontWeight: '500',
  },
  toolLabelActive: {
    color: colors.background,
  },
  resetButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  resetLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});

