import {useCallback, useEffect, useMemo, useReducer} from 'react';

import {ColoringPage, ColoringTool} from '../models/coloringTypes';
import {
  BrushStroke,
  coloringReducer,
  createInitialColoringState,
} from '../state/coloringReducer';

export const useColoringSession = (page: ColoringPage | null) => {
  const defaultColor = page?.palette[0] ?? '#FFFFFF';
  const [state, dispatch] = useReducer(
    coloringReducer,
    createInitialColoringState(defaultColor),
  );

  useEffect(() => {
    dispatch({
      type: 'RESET_WITH_COLOR',
      payload: page?.palette[0] ?? '#FFFFFF',
    });
  }, [page?.id, page?.palette]);

  const selectColor = useCallback((hex: string) => {
    dispatch({type: 'SET_COLOR', payload: hex});
  }, []);

  const selectTool = useCallback((tool: ColoringTool) => {
    dispatch({type: 'SET_TOOL', payload: tool});
  }, []);

  const paintPath = useCallback((pathId: string) => {
    if (!page) {
      return;
    }
    dispatch({type: 'PAINT_PATH', payload: {pathId}});
  }, [page]);

  const resetPainting = useCallback(() => {
    dispatch({type: 'RESET'});
  }, []);

  const addBrushStroke = useCallback((stroke: BrushStroke) => {
    dispatch({type: 'ADD_BRUSH_STROKE', payload: stroke});
  }, []);

  const setBrushWidth = useCallback((width: number) => {
    dispatch({type: 'SET_BRUSH_WIDTH', payload: width});
  }, []);

  const undo = useCallback(() => {
    dispatch({type: 'UNDO'});
  }, []);

  const redo = useCallback(() => {
    dispatch({type: 'REDO'});
  }, []);

  return useMemo(
    () => ({
      state,
      selectColor,
      selectTool,
      paintPath,
      resetPainting,
      addBrushStroke,
      setBrushWidth,
      undo,
      redo,
    }),
    [
      addBrushStroke,
      paintPath,
      redo,
      resetPainting,
      selectColor,
      selectTool,
      setBrushWidth,
      state,
      undo,
    ],
  );
};

