import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {colors, spacing, typography} from '@/core/theme';

type ColorPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (hex: string) => void;
  initialColor: string;
};

const EXTENDED_SWATCHES = [
  '#EF4444',
  '#F97316',
  '#FACC15',
  '#34D399',
  '#22D3EE',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#FB7185',
  '#FCD34D',
  '#A3E635',
  '#4ADE80',
  '#2DD4BF',
  '#38BDF8',
  '#818CF8',
  '#C084FC',
  '#F472B6',
  '#F9A8D4',
  '#FDE68A',
];

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialColor,
}) => {
  const [value, setValue] = useState(initialColor);
  const normalized = useMemo(() => normalizeHex(value), [value]);
  const isValid = normalized !== null;

  useEffect(() => {
    if (visible) {
      setValue(initialColor);
    }
  }, [visible, initialColor]);

  const handleSwatchSelect = (hex: string) => {
    setValue(hex);
  };

  const handleConfirm = () => {
    if (normalized) {
      onConfirm(normalized);
      onClose();
      return;
    }
    setValue(prev => prev.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Paleta avançada</Text>
          <Text style={styles.subtitle}>
            Toque em uma cor ou informe um código hexadecimal.
          </Text>

          <View style={styles.previewRow}>
            <View style={[styles.previewCircle, {backgroundColor: normalized ?? '#FFFFFF'}]} />
            <Text style={styles.previewValue}>
              {normalized ?? 'Hex inválido'}
            </Text>
          </View>

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder="#AABBCC"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            style={[styles.input, !isValid && styles.inputError]}
          />

          <View style={styles.swatchGrid}>
            {EXTENDED_SWATCHES.map(hex => (
              <Pressable
                key={hex}
                onPress={() => handleSwatchSelect(hex)}
                style={[
                  styles.swatch,
                  {backgroundColor: hex},
                  value === hex && styles.swatchSelected,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar cor ${hex}`}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.buttonGhost]} onPress={onClose}>
              <Text style={[styles.buttonLabel, styles.buttonGhostLabel]}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonPrimary, !isValid && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={!isValid}>
              <Text style={styles.buttonLabel}>Adicionar cor</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const normalizeHex = (value: string): string | null => {
  if (!value) {
    return null;
  }
  const sanitized = value.trim().replace('#', '').toUpperCase();
  if (sanitized.length === 3) {
    const expanded = sanitized
      .split('')
      .map(ch => ch + ch)
      .join('');
    return `#${expanded}`;
  }
  if (/^[0-9A-F]{6}$/.test(sanitized)) {
    return `#${sanitized}`;
  }
  return null;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: spacing.xl,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  previewCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  previewValue: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  inputError: {
    borderColor: colors.danger,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: colors.accent,
    transform: [{scale: 1.1}],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  buttonGhostLabel: {
    color: colors.textSecondary,
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonLabel: {
    color: colors.background,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});


