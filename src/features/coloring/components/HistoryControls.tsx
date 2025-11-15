import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, spacing, typography} from '@/core/theme';

type HistoryControlsProps = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
};

export const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, !canUndo && styles.buttonDisabled]}
        onPress={onUndo}
        disabled={!canUndo}
        accessibilityRole="button"
        accessibilityLabel="Desfazer">
        <Text style={[styles.buttonText, !canUndo && styles.buttonTextDisabled]}>
          ↶ Desfazer
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.buttonSpacing, !canRedo && styles.buttonDisabled]}
        onPress={onRedo}
        disabled={!canRedo}
        accessibilityRole="button"
        accessibilityLabel="Refazer">
        <Text style={[styles.buttonText, !canRedo && styles.buttonTextDisabled]}>
          ↷ Refazer
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonSpacing: {
    marginLeft: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
});

