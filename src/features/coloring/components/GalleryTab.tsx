import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, spacing, typography} from '@/core/theme';
import {ColoringPage} from '../models/coloringTypes';

type GalleryTabProps = {
  importedPages: ColoringPage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRequestImport: () => void;
};

export const GalleryTab: React.FC<GalleryTabProps> = ({
  importedPages,
  selectedId,
  onSelect,
  onDelete,
  onRequestImport,
}) => {
  const handleDelete = (pageId: string, event: any) => {
    event.stopPropagation();
    onDelete(pageId);
  };

  const renderItem = ({item}: {item: ColoringPage}) => {
    const isActive = selectedId === item.id;
    const isImported = item.id.startsWith('custom-');

    return (
      <Pressable
        style={[styles.card, isActive && styles.cardActive]}
        onPress={() => onSelect(item.id)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardMeta}>
              {item.paths.length} {item.paths.length === 1 ? 'path' : 'paths'}
            </Text>
          </View>
          {isImported && (
            <Pressable
              style={styles.deleteButton}
              onPress={e => handleDelete(item.id, e)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </Pressable>
          )}
        </View>
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Galeria</Text>
        <Text style={styles.subtitle}>
          {importedPages.length} {importedPages.length === 1 ? 'arte importada' : 'artes importadas'}
        </Text>
      </View>

      {importedPages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>Nenhuma arte importada</Text>
          <Text style={styles.emptyDescription}>
            Importe SVGs para começar a criar sua galeria personalizada.
          </Text>
          <Pressable style={styles.importButton} onPress={onRequestImport}>
            <Text style={styles.importButtonText}>📁 Importar SVG</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={importedPages}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
          <Pressable style={styles.addButton} onPress={onRequestImport}>
            <Text style={styles.addButtonIcon}>＋</Text>
            <Text style={styles.addButtonText}>Importar novo SVG</Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: {
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
    borderRadius: spacing.xs,
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  importButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
  },
  importButtonText: {
    color: colors.background,
    fontSize: typography.body,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    marginTop: spacing.md,
  },
  addButtonIcon: {
    fontSize: 20,
    color: colors.accent,
    marginRight: spacing.sm,
  },
  addButtonText: {
    color: colors.accent,
    fontSize: typography.body,
    fontWeight: '600',
  },
});

