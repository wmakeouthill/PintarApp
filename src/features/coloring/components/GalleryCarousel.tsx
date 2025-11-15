import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, spacing, typography} from '@/core/theme';
import {ColoringPage} from '../models/coloringTypes';

type GalleryCarouselProps = {
  pages: ColoringPage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRequestImport: () => void;
};

export const GalleryCarousel: React.FC<GalleryCarouselProps> = ({
  pages,
  selectedId,
  onSelect,
  onRequestImport,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Galeria</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[...pages, IMPORT_PLACEHOLDER]}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => {
          if (item.id === IMPORT_PLACEHOLDER.id) {
            return (
              <Pressable
                style={[styles.card, styles.importCard]}
                accessibilityRole="button"
                accessibilityLabel="Importar novo SVG"
                onPress={onRequestImport}>
                <Text style={styles.importIcon}>＋</Text>
                <Text style={styles.cardName}>Importar SVG</Text>
                <Text style={styles.cardDescription}>
                  Cole o conteúdo do arquivo e pinte imediatamente.
                </Text>
              </Pressable>
            );
          }

          const isActive = selectedId === item.id;
          return (
            <Pressable
              style={[styles.card, isActive && styles.cardActive]}
              accessibilityRole="button"
              accessibilityState={{selected: isActive}}
              onPress={() => onSelect(item.id)}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
};

const IMPORT_PLACEHOLDER: ColoringPage = {
  id: 'import-placeholder',
  name: '',
  viewBox: '0 0 0 0',
  palette: [],
  paths: [],
};

const CARD_WIDTH = 220;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  card: {
    width: CARD_WIDTH,
    padding: spacing.md,
    borderRadius: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: {
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  importCard: {
    borderStyle: 'dashed',
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importIcon: {
    fontSize: 32,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
});


