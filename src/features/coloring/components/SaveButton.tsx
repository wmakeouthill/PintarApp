import React, {useState} from 'react';
import {Alert, Pressable, Share, StyleSheet, Text, View} from 'react-native';
import {captureRef} from 'react-native-view-shot';

import {colors, spacing, typography} from '@/core/theme';

type SaveButtonProps = {
  canvasRef: React.RefObject<View>;
  artworkName: string;
};

export const SaveButton: React.FC<SaveButtonProps> = ({canvasRef, artworkName}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!canvasRef.current) {
      return;
    }

    try {
      setIsSaving(true);
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1.0,
      });

      await Share.share({
        url: uri,
        title: artworkName,
        message: `Minha arte: ${artworkName}`,
      });
    } catch (err) {
      if ((err as {message?: string})?.message?.includes('User did not share')) {
        return;
      }
      console.error('Failed to save artwork:', err);
      Alert.alert('Erro', 'Não foi possível salvar a arte. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Pressable
      style={[styles.button, isSaving && styles.buttonDisabled]}
      onPress={handleSave}
      disabled={isSaving}
      accessibilityRole="button"
      accessibilityLabel="Salvar arte">
      <Text style={styles.buttonText}>
        {isSaving ? 'Salvando...' : '💾 Salvar arte'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontSize: typography.caption,
    fontWeight: '700',
  },
});

