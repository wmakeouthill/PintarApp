import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {Screen} from '@/core/components/Screen';
import {colors, spacing, typography} from '@/core/theme';
import {GalleryCarousel} from '../components/GalleryCarousel';
import {ImportSvgModal} from '../components/ImportSvgModal';
import {Sidebar} from '../components/Sidebar';
import {SvgColoringSurface} from '../components/SvgColoringSurface';
import {coloringLibrary} from '../data/coloringLibrary';
import {useColoringSession} from '../hooks/useColoringSession';
import {usePersistedColors} from '../hooks/usePersistedColors';
import {usePersistedPages} from '../hooks/usePersistedPages';
import {ColoringPage} from '../models/coloringTypes';

export const ColoringScreen = (): React.JSX.Element => {
  const {pages: persistedPages, addPage: persistPage} = usePersistedPages();
  const {colors: persistedColors, addColor: persistColor} = usePersistedColors();
  const canvasRef = useRef<View>(null);

  const [pages, setPages] = useState<ColPageList>(coloringLibrary);
  const [selectedId, setSelectedId] = useState<string | null>(
    coloringLibrary[0]?.id ?? null,
  );
  const [isImportVisible, setImportVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    if (persistedPages.length > 0) {
      setPages(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPages = persistedPages.filter(p => !existingIds.has(p.id));
        return [...newPages, ...prev];
      });
    }
  }, [persistedPages]);

  const page = useMemo(
    () => pages.find(item => item.id === selectedId) ?? pages[0] ?? null,
    [pages, selectedId],
  );

  const {
    state,
    selectColor,
    selectTool,
    paintPath,
    resetPainting,
    addBrushStroke,
    setBrushWidth,
    undo,
    redo,
  } = useColoringSession(page);

  const palette = useMemo(() => {
    if (!page) {
      return [];
    }
    const merged = [...page.palette, ...persistedColors];
    return Array.from(new Set(merged));
  }, [persistedColors, page]);

  const handleAddCustomColor = async (hex: string) => {
    await persistColor(hex);
    selectColor(hex);
  };

  const handleImportPage = async (newPage: ColoringPage) => {
    setPages(prev => [newPage, ...prev]);
    setSelectedId(newPage.id);
    await persistPage(newPage);
  };

  const hasActivePage = Boolean(page);

  return (
    <Screen>
      <View style={styles.container}>
        {hasActivePage && page ? (
          <>
            <View style={styles.canvasArea}>
              <View ref={canvasRef} style={styles.canvasWrapper}>
                <View style={styles.header}>
                  <Pressable
                    style={styles.galleryButton}
                    onPress={() => setShowGallery(true)}>
                    <Text style={styles.galleryButtonText}>📚</Text>
                  </Pressable>
                  <View style={styles.headerInfo}>
                    <Text style={styles.title} numberOfLines={1}>
                      {page.name}
                    </Text>
                    <Text style={styles.badge}>{page.paths.length} paths</Text>
                  </View>
                </View>
                <SvgColoringSurface
                  page={page}
                  colorMap={state.colorMap}
                  brushStrokes={state.brushStrokes}
                  activeTool={state.activeTool}
                  selectedColor={state.selectedColor}
                  brushWidth={state.brushWidth}
                  onPathPress={paintPath}
                  onColorPick={selectColor}
                  onBrushStroke={addBrushStroke}
                />
              </View>
            </View>

            <Sidebar
              selectedColor={state.selectedColor}
              onColorSelect={selectColor}
              activeTool={state.activeTool}
              onToolSelect={selectTool}
              onReset={resetPainting}
              brushWidth={state.brushWidth}
              onBrushWidthChange={setBrushWidth}
              canUndo={state.historyIndex > 0}
              canRedo={state.historyIndex < state.history.length - 1}
              onUndo={undo}
              onRedo={redo}
              canvasRef={canvasRef}
              artworkName={page.name}
              palette={palette}
              customSwatches={persistedColors}
              onAddFavorite={handleAddCustomColor}
              onOpenImport={() => setImportVisible(true)}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhuma arte disponível</Text>
            <Text style={styles.emptyDescription}>
              Importe um SVG para começar a colorir.
            </Text>
            <Pressable
              style={styles.importButton}
              onPress={() => setImportVisible(true)}>
              <Text style={styles.importButtonText}>📁 Importar SVG</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Modal
        visible={showGallery}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGallery(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Galeria</Text>
              <Pressable onPress={() => setShowGallery(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <GalleryCarousel
              pages={pages}
              selectedId={page?.id ?? null}
              onSelect={id => {
                setSelectedId(id);
                setShowGallery(false);
              }}
              onRequestImport={() => {
                setShowGallery(false);
                setImportVisible(true);
              }}
            />
          </View>
        </View>
      </Modal>

      <ImportSvgModal
        visible={isImportVisible}
        onClose={() => setImportVisible(false)}
        onSubmit={handleImportPage}
      />
    </Screen>
  );
};

type ColPageList = ColoringPage[];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvasArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  canvasWrapper: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  galleryButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  galleryButtonText: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    marginLeft: spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  emptyDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  modalClose: {
    color: colors.textSecondary,
    fontSize: 24,
    padding: spacing.xs,
  },
});

