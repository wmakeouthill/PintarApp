import React, {useState} from 'react';
import {
  Modal,
  Platform,
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

  // Função auxiliar para ler arquivo com tratamento de codificação
  const readFileWithEncoding = async (fileUri: string): Promise<string> => {
    try {
      // Primeira tentativa: UTF-8
      let content = await RNFS.readFile(fileUri, 'utf8');
      // Remove BOM (Byte Order Mark) se presente
      content = content.replace(/^\uFEFF/, '');
      // Remove caracteres de controle inválidos (exceto quebras de linha e tabs)
      content = content.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
      return content;
    } catch (utf8Error: any) {
      // Se falhar com UTF-8, tenta ler como base64 e converter
      const errorMessage = utf8Error?.message || '';
      if (
        errorMessage.includes('UTF-8') ||
        errorMessage.includes('utf') ||
        errorMessage.includes('encoding') ||
        errorMessage.includes('codificação')
      ) {
        try {
          // Lê como base64
          const base64Content = await RNFS.readFile(fileUri, 'base64');
          // Converte base64 para string
          let decodedContent: string;
          
          // Tenta usar Buffer se disponível (React Native pode ter polyfill)
          if (typeof Buffer !== 'undefined') {
            decodedContent = Buffer.from(base64Content, 'base64').toString('utf8');
          } else {
            // Fallback: converte base64 para bytes e usa TextDecoder
            try {
              // Decodifica base64 para bytes
              const binaryString = atob(base64Content);
              // Converte para array de bytes
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              // Converte bytes para string UTF-8 usando TextDecoder
              // TextDecoder está disponível no React Native 0.60+
              if (typeof TextDecoder !== 'undefined') {
                const decoder = new TextDecoder('utf-8', {fatal: false});
                decodedContent = decoder.decode(bytes);
              } else {
                // Fallback muito simples: tenta usar a string binária diretamente
                // Isso pode não funcionar perfeitamente, mas é melhor que nada
                decodedContent = binaryString;
              }
            } catch (decodeError) {
              console.error('Erro ao decodificar base64:', decodeError);
              // Se tudo falhar, tenta ler como ASCII
              throw decodeError;
            }
          }
          
          // Remove BOM se presente e caracteres inválidos
          decodedContent = decodedContent.replace(/^\uFEFF/, '');
          decodedContent = decodedContent.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
          return decodedContent;
        } catch (base64Error) {
          console.error('Erro ao ler como base64:', base64Error);
          // Última tentativa: tenta ler como ASCII (pode perder alguns caracteres)
          try {
            let asciiContent = await RNFS.readFile(fileUri, 'ascii');
            asciiContent = asciiContent.replace(/^\uFEFF/, '');
            asciiContent = asciiContent.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
            return asciiContent;
          } catch (asciiError) {
            throw new Error(
              'Não foi possível ler o arquivo. O arquivo pode estar corrompido ou em uma codificação não suportada. Tente salvar o arquivo como UTF-8.',
            );
          }
        }
      }
      throw utf8Error;
    }
  };

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
        let content: string;
        
        // Prioriza fileCopyUri quando disponível (arquivo copiado para cache)
        if (file.fileCopyUri) {
          try {
            // Remove prefixo file:// se existir
            const cleanUri = file.fileCopyUri.replace(/^file:\/\//, '');
            // Verifica se o arquivo existe
            const exists = await RNFS.exists(cleanUri);
            if (exists) {
              content = await readFileWithEncoding(cleanUri);
            } else {
              throw new Error('Arquivo copiado não encontrado no cache.');
            }
          } catch (readError) {
            console.error('Erro ao ler fileCopyUri:', readError);
            // Se falhar com fileCopyUri, tenta com uri original
            throw readError;
          }
        } else if (file.uri) {
          // Se não tiver fileCopyUri, tenta ler da URI original
          try {
            // No Android, pode ser content:// que RNFS não suporta bem
            // Tenta remover file:// se existir
            let cleanUri = file.uri;
            if (cleanUri.startsWith('file://')) {
              cleanUri = cleanUri.replace(/^file:\/\//, '');
              content = await readFileWithEncoding(cleanUri);
            } else if (Platform.OS === 'android' && cleanUri.startsWith('content://')) {
              // Para content:// no Android, tenta usar RNFS diretamente
              // Se falhar, pode ser necessário usar outra abordagem
              try {
                content = await readFileWithEncoding(cleanUri);
              } catch {
                // Se RNFS não conseguir ler content://, tenta sem copyTo na próxima vez
                throw new Error(
                  'Não foi possível acessar o arquivo. Tente selecionar o arquivo novamente.',
                );
              }
            } else {
              content = await readFileWithEncoding(cleanUri);
            }
          } catch (readError) {
            console.error('Erro ao ler uri original:', readError);
            throw new Error(
              'Não foi possível ler o arquivo selecionado. Verifique se o arquivo é válido.',
            );
          }
        } else {
          throw new Error('URI do arquivo não disponível.');
        }
        
        if (!content || content.trim().length === 0) {
          throw new Error('O arquivo selecionado está vazio.');
        }
        
        // Quando importa via arquivo, processa e adiciona automaticamente
        try {
          const fileName = file.name
            ? file.name.replace(/\.svg$/i, '')
            : 'Arte personalizada';
          const page = convertSvgToColoringPage(content, {
            name: fileName,
          });
          onSubmit(page);
          setName('');
          setSvg('');
          setError(null);
          onClose();
        } catch (convertError) {
          // Se a conversão falhar, mostra o erro mas mantém o código para edição manual
          const errorMessage =
            convertError instanceof Error
              ? convertError.message
              : 'Não foi possível interpretar o SVG. Você pode editar o código manualmente.';
          setError(errorMessage);
          setSvg(content);
          if (!name && file.name) {
            const baseName = file.name.replace(/\.svg$/i, '');
            setName(baseName);
          }
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return;
      }
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Não foi possível ler o arquivo selecionado.';
      setError(errorMessage);
      console.error('Erro ao importar SVG:', err);
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
            Selecione um arquivo SVG para importar automaticamente ou cole o conteúdo manualmente.
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
            placeholder="Cole o código SVG aqui (ou selecione um arquivo acima)"
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
    minHeight: 120,
    maxHeight: 200,
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



