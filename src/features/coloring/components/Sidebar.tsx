import React, {useState} from 'react';
import {Animated, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {colors, spacing, typography} from '@/core/theme';
import {BrushWidthSlider} from './BrushWidthSlider';
import {ColorPalette} from './ColorPalette';
import {HistoryControls} from './HistoryControls';
import {RgbColorPicker} from './RgbColorPicker';
import {SaveButton} from './SaveButton';
import {Toolbox} from './Toolbox';
import {ColoringTool} from '../models/coloringTypes';

type SidebarProps = {
  selectedColor: string;
  onColorSelect: (hex: string) => void;
  activeTool: ColoringTool;
  onToolSelect: (tool: ColoringTool) => void;
  onReset: () => void;
  brushWidth: number;
  onBrushWidthChange: (width: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canvasRef: React.RefObject<View>;
  artworkName: string;
  palette: string[];
  customSwatches: string[];
  onOpenImport?: () => void;
};

const SIDEBAR_WIDTH = 240;
const TOGGLE_BUTTON_WIDTH = 40;

export const Sidebar: React.FC<SidebarProps> = ({
  selectedColor,
  onColorSelect,
  activeTool,
  onToolSelect,
  onReset,
  brushWidth,
  onBrushWidthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  canvasRef,
  artworkName,
  palette,
  customSwatches,
  onOpenImport,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'tools' | 'settings'>('colors');
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SIDEBAR_WIDTH, 0],
  });

  return (
    <>
      <Pressable
        style={[styles.toggleButton, isOpen && styles.toggleButtonActive]}
        onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.toggleIcon}>{isOpen ? '◀' : '▶'}</Text>
      </Pressable>

      <Animated.View
        style={[
          styles.overlay,
          {
            transform: [{translateX}],
            opacity: slideAnim,
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}>
        <View style={styles.container}>
          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, activeTab === 'colors' && styles.tabActive]}
              onPress={() => setActiveTab('colors')}>
              <Text style={[styles.tabText, activeTab === 'colors' && styles.tabTextActive]}>
                🎨
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'tools' && styles.tabActive]}
              onPress={() => setActiveTab('tools')}>
              <Text style={[styles.tabText, activeTab === 'tools' && styles.tabTextActive]}>
                🛠️
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
              onPress={() => setActiveTab('settings')}>
              <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
                ⚙️
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'colors' && (
              <View style={styles.tabContent}>
                <RgbColorPicker value={selectedColor} onChange={onColorSelect} />
                <View style={styles.divider} />
                <ColorPalette
                  swatches={palette}
                  customSwatches={customSwatches}
                  selected={selectedColor}
                  onSelect={onColorSelect}
                />
              </View>
            )}

            {activeTab === 'tools' && (
              <View style={styles.tabContent}>
                <Toolbox activeTool={activeTool} onSelect={onToolSelect} onReset={onReset} />
                {activeTool === 'brush' && (
                  <>
                    <View style={styles.divider} />
                    <BrushWidthSlider
                      value={brushWidth}
                      onValueChange={onBrushWidthChange}
                      visible={true}
                    />
                  </>
                )}
                <View style={styles.divider} />
                <HistoryControls canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo} />
              </View>
            )}

            {activeTab === 'settings' && (
              <View style={styles.tabContent}>
                <SaveButton canvasRef={canvasRef} artworkName={artworkName} />
                {onOpenImport && (
                  <Pressable style={styles.importButton} onPress={onOpenImport}>
                    <Text style={styles.importButtonText}>📁 Importar</Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: TOGGLE_BUTTON_WIDTH,
    height: 80,
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.md,
    borderBottomLeftRadius: spacing.md,
    borderRightWidth: 0,
    borderLeftWidth: 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleButtonActive: {
    backgroundColor: colors.surfaceAlt,
  },
  toggleIcon: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH + TOGGLE_BUTTON_WIDTH,
    zIndex: 999,
  },
  container: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: -2, height: 0},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tabs: {
    width: 40,
    backgroundColor: colors.surfaceAlt,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.xs,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderRadius: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  tabText: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabTextActive: {
    opacity: 1,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  importButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  importButtonText: {
    color: colors.background,
    fontSize: typography.caption,
    fontWeight: '600',
  },
});

