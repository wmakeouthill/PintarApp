import React from 'react';
import {StatusBar} from 'react-native';

import {colors} from '@/core/theme';
import {AppProviders} from './providers/AppProviders';
import {ColoringScreen} from '@/features/coloring/screens/ColoringScreen';

export const App = (): React.JSX.Element => {
  return (
    <AppProviders>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ColoringScreen />
    </AppProviders>
  );
};

