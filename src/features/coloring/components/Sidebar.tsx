import React, {useMemo, useState} from 'react';
import {Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';

import {colors, spacing, typography} from '@/core/theme';
import {BrushWidthSlider} from './BrushWidthSlider';
import {ColorPalette} from './ColorPalette';
import {ColorWheel} from './ColorWheel';
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
  onAddFavorite?: (hex: string) => void;
  onOpenImport?: () => void;
};

// Constants for sidebar sizing
const MIN_SIDEBAR_WIDTH = 380;
const MAX_SIDEBAR_WIDTH = 520;
const SIDEBAR_WIDTH_PERCENT = 0.32; // 32% of screen width for tablets
const TAB_WIDTH = 72;
const TOGGLE_BUTTON_WIDTH = 52;
const MIN_COLOR_WHEEL_SIZE = 240;
const MAX_COLOR_WHEEL_SIZE = 360;

type TabType = 'colors' | 'tools' | 'settings';

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
  onAddFavorite,
  onOpenImport,
}) => {
  const {width: screenWidth} = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('colors');
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Calculate sidebar width dynamically based on screen size
  const sidebarWidth = useMemo(() => {
    const calculatedWidth = screenWidth * SIDEBAR_WIDTH_PERCENT;
    return Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, calculatedWidth));
  }, [screenWidth]);

  // Calculate color wheel size based on sidebar width
  const colorWheelSize = useMemo(() => {
    const availableWidth = sidebarWidth - TAB_WIDTH - spacing.xl * 2; // Account for tabs and padding
    return Math.max(
      MIN_COLOR_WHEEL_SIZE,
      Math.min(MAX_COLOR_WHEEL_SIZE, availableWidth),
    );
  }, [sidebarWidth]);

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sidebarWidth, 0],
  });

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colors':
        return (
          <View style={styles.tabContent}>
            <View style={styles.colorWheelContainer}>
              <ColorWheel
                size={colorWheelSize}
                value={selectedColor}
                onChange={onColorSelect}
              />
            </View>
            {onAddFavorite && (
              <Pressable
                style={styles.saveFavoriteButton}
                onPress={() => onAddFavorite(selectedColor)}>
                <Text style={styles.saveFavoriteIcon}>⭐</Text>
                <Text style={styles.saveFavoriteText}>Salvar como favorita</Text>
              </Pressable>
            )}
            <View style={styles.divider} />
            <ColorPalette
              swatches={palette}
              customSwatches={customSwatches}
              selected={selectedColor}
              onSelect={onColorSelect}
            />
          </View>
        );

      case 'tools':
        return (
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
        );

      case 'settings':
        return (
          <View style={styles.tabContent}>
            <SaveButton canvasRef={canvasRef} artworkName={artworkName} />
            {onOpenImport && (
              <Pressable style={styles.importButton} onPress={onOpenImport}>
                <Text style={styles.importButtonIcon}>📄</Text>
                <Text style={styles.importButtonText}>Importar SVG</Text>
              </Pressable>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  const tabConfig: Array<{id: TabType; icon: string}> = [
    {id: 'colors', icon: '🎨'},
    {id: 'tools', icon: '🛠️'},
    {id: 'settings', icon: '⚙️'},
  ];

  return (
    <>
      <Pressable
        style={[styles.toggleButton, isOpen && styles.toggleButtonActive]}
        onPress={toggleSidebar}>
        <Text style={styles.toggleIcon}>{isOpen ? '◀' : '▶'}</Text>
      </Pressable>

      <Animated.View
        style={[
          styles.overlay,
          {
            width: sidebarWidth + TOGGLE_BUTTON_WIDTH,
            transform: [{translateX}],
            opacity: slideAnim,
          },
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}>
        <View style={[styles.container, {width: sidebarWidth}]}>
          <View style={styles.tabs}>
            {tabConfig.map(tab => (
              <Pressable
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => handleTabPress(tab.id)}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.id && styles.tabTextActive,
                  ]}>
                  {tab.icon}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderTabContent()}
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
    height: 96,
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
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
  },
  container: {
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
    width: TAB_WIDTH,
    backgroundColor: colors.surfaceAlt,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.md,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: spacing.md,
    minHeight: 64,
  },
  tabActive: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  tabText: {
    fontSize: 32,
    opacity: 0.6,
  },
  tabTextActive: {
    opacity: 1,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  saveFavoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 52,
  },
  saveFavoriteIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  saveFavoriteText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.md,
    marginTop: spacing.lg,
    minHeight: 56,
  },
  importButtonIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  importButtonText: {
    color: colors.background,
    fontSize: typography.body,
    fontWeight: '600',
  },
  colorWheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
});

