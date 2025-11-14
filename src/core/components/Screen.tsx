import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors, spacing} from '../theme';

type ScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const Screen: React.FC<ScreenProps> = ({children, style, testID}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, spacing.md),
          paddingBottom: Math.max(insets.bottom, spacing.lg),
        },
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
});

