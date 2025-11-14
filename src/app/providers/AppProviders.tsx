import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders: React.FC<AppProvidersProps> = ({children}) => {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
};

