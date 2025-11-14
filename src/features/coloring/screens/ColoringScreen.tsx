import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Screen} from '@/core/components/Screen';
import {colors, spacing, typography} from '@/core/theme';
import {ColorPalette} from '../components/ColorPalette';
import {SvgColoringSurface} from '../components/SvgColoringSurface';
import {Toolbox} from '../components/Toolbox';
import {sampleColoringPage} from '../data/sampleColoringPage';
import {useColoringSession} from '../hooks/useColoringSession';

export const ColoringScreen = (): React.JSX.Element => {
  const page = sampleColoringPage;
  const {state, selectColor, selectTool, paintPath, resetPainting} =
    useColoringSession(page);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{page.name}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </View>

      <SvgColoringSurface
        page={page}
        colorMap={state.colorMap}
        onPathPress={paintPath}
      />

      <ColorPalette
        swatches={page.palette}
        selected={state.selectedColor}
        onSelect={selectColor}
      />

      <Toolbox
        activeTool={state.activeTool}
        onSelect={selectTool}
        onReset={resetPainting}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '600',
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
});

