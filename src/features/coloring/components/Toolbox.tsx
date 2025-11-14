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
};

export const Toolbox: React.FC<ToolboxProps> = ({
  activeTool,
  onSelect,
  onReset,
}) => {
  return (
    <View style={styles.container}>
      {(Object.keys(TOOL_LABELS) as ColoringTool[]).map((tool, index, arr) => {
        const isActive = tool === activeTool;
        return (
          <Pressable
            key={tool}
            style={[
              styles.toolButton,
              isActive && {backgroundColor: colors.accent},
              index < arr.length - 1 && styles.toolSpacing,
            ]}
            accessibilityRole="button"
            accessibilityState={{selected: isActive}}
            onPress={() => onSelect(tool)}>
            <Text
              style={[
                styles.toolLabel,
                isActive && {color: colors.background},
              ]}>
              {TOOL_LABELS[tool]}
            </Text>
          </Pressable>
        );
      })}
      <Pressable style={[styles.resetButton]} onPress={onReset}>
        <Text style={styles.resetLabel}>Limpar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  toolButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toolSpacing: {
    marginRight: spacing.md,
  },
  toolLabel: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  resetButton: {
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  resetLabel: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    textTransform: 'uppercase',
  },
});

