import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

import {colors, spacing} from '@/core/theme';
import {ColoringPage} from '../models/coloringTypes';

type SvgColoringSurfaceProps = {
  page: ColoringPage;
  colorMap: Record<string, string>;
  onPathPress: (pathId: string) => void;
};

export const SvgColoringSurface: React.FC<SvgColoringSurfaceProps> = ({
  page,
  colorMap,
  onPathPress,
}) => {
  return (
    <View style={styles.canvasContainer}>
      <Svg
        viewBox={page.viewBox}
        style={styles.svg}
        preserveAspectRatio="xMidYMid meet">
        {page.paths.map(path => (
          <Path
            key={path.id}
            d={path.d}
            fill={colorMap[path.id] ?? colors.surface}
            stroke={colors.border}
            strokeWidth={path.strokeWidth ?? 1.5}
            onPress={() => onPathPress(path.id)}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  svg: {
    flex: 1,
  },
});

