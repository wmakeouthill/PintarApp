import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DocumentPicker, {types} from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import {colors, spacing, typography} from '@/core/theme';
import {ColoringPage} from '../models/coloringTypes';
import {convertSvgToColoringPage} from '../utils/svgImport';

type ImportSvgModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (page: ColoringPage) => void;
};

export const ImportSvgModal: React.FC<ImportSvgModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickFile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await DocumentPicker.pick({
        type: [types.plainText, types.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (result.length > 0) {
        const file = result[0];
        const content = await RNFS.readFile(file.fileCopyUri || file.uri, 'utf8');
        setSvg(content);
        if (!name && file.name) {
          const baseName = file.name.replace(/\.svg$/i, '');
          setName(baseName);
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return;
      }
      setError('Não foi possível ler o arquivo selecionado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    try {
      const page = convertSvgToColoringPage(svg, {
        name: name || 'Arte personalizada',
      });
      onSubmit(page);
      setName('');
      setSvg('');
      setError(null);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível interpretar o SVG informado.',
      );
    }
  };

  const canSubmit = svg.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Importar SVG personalizado</Text>
          <Text style={styles.subtitle}>
            Selecione um arquivo SVG ou cole o conteúdo manualmente.
          </Text>

          <Pressable
            style={[styles.fileButton, isLoading && styles.fileButtonDisabled]}
            onPress={handlePickFile}
            disabled={isLoading}>
            <Text style={styles.fileButtonLabel}>
              {isLoading ? 'Carregando...' : '📁 Selecionar arquivo SVG'}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            placeholder="Nome da arte"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="<svg ...></svg>"
            placeholderTextColor={colors.textMuted}
            value={svg}
            onChangeText={setSvg}
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textarea]}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.buttonGhost]} onPress={onClose}>
              <Text style={[styles.buttonLabel, styles.buttonGhostLabel]}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.buttonPrimary,
                !canSubmit && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}>
              <Text style={styles.buttonLabel}>Adicionar à galeria</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    padding: spacing.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  textarea: {
    minHeight: 160,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: spacing.md,
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
  buttonPrimary: {
    backgroundColor: colors.accent,
  },
  buttonLabel: {
    color: colors.background,
    fontWeight: '600',
  },
  buttonGhostLabel: {
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fileButton: {
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderRadius: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceAlt,
  },
  fileButtonDisabled: {
    opacity: 0.6,
  },
  fileButtonLabel: {
    color: colors.accent,
    fontSize: typography.body,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    marginHorizontal: spacing.md,
    fontSize: typography.caption,
  },
});


