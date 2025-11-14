import {useCallback, useMemo, useReducer} from 'react';

import {ColoringPage, ColoringTool} from '../models/coloringTypes';
import {
  coloringReducer,
  createInitialColoringState,
} from '../state/coloringReducer';

export const useColoringSession = (page: ColoringPage | null) => {
  const defaultColor = page?.palette[0] ?? '#FFFFFF';
  const [state, dispatch] = useReducer(
    coloringReducer,
    createInitialColoringState(defaultColor),
  );

  const selectColor = useCallback((hex: string) => {
    dispatch({type: 'SET_COLOR', payload: hex});
  }, []);

  const selectTool = useCallback((tool: ColoringTool) => {
    dispatch({type: 'SET_TOOL', payload: tool});
  }, []);

  const paintPath = useCallback((pathId: string) => {
    dispatch({type: 'PAINT_PATH', payload: {pathId}});
  }, []);

  const resetPainting = useCallback(() => {
    dispatch({type: 'RESET'});
  }, []);

  return useMemo(
    () => ({
      state,
      selectColor,
      selectTool,
      paintPath,
      resetPainting,
    }),
    [paintPath, resetPainting, selectColor, selectTool, state],
  );
};

