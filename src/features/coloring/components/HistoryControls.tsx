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
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  buttonSpacing: {
    marginLeft: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
});

