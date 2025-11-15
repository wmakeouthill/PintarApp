import {ColoringTool} from '../models/coloringTypes';

export type BrushStroke = {
  id: string;
  d: string;
  color: string;
  width: number;
  clipPathId?: string;
};

export type ColoringState = {
  selectedColor: string;
  activeTool: ColoringTool;
  colorMap: Record<string, string>;
  brushStrokes: BrushStroke[];
  brushWidth: number;
  history: Array<{
    colorMap: Record<string, string>;
    brushStrokes: BrushStroke[];
  }>;
  historyIndex: number;
};

type ColoringAction =
  | {type: 'SET_COLOR'; payload: string}
  | {type: 'SET_TOOL'; payload: ColoringTool}
  | {type: 'PAINT_PATH'; payload: {pathId: string}}
  | {type: 'ADD_BRUSH_STROKE'; payload: BrushStroke}
  | {type: 'SET_BRUSH_WIDTH'; payload: number}
  | {type: 'UNDO'}
  | {type: 'REDO'}
  | {type: 'RESET'}
  | {type: 'RESET_WITH_COLOR'; payload: string};

const createHistoryEntry = (
  colorMap: Record<string, string>,
  brushStrokes: BrushStroke[],
) => ({
  colorMap: {...colorMap},
  brushStrokes: [...brushStrokes],
});

export const createInitialColoringState = (
  defaultColor: string,
): ColoringState => {
  const initialState = {
    selectedColor: defaultColor,
    activeTool: 'fill' as ColoringTool,
    colorMap: {},
    brushStrokes: [],
    brushWidth: 8,
    history: [createHistoryEntry({}, [])],
    historyIndex: 0,
  };
  return initialState;
};

const addToHistory = (
  state: ColoringState,
  newColorMap: Record<string, string>,
  newBrushStrokes: BrushStroke[],
): ColoringState => {
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(createHistoryEntry(newColorMap, newBrushStrokes));
  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
};

export const coloringReducer = (
  state: ColoringState,
  action: ColoringAction,
): ColoringState => {
  switch (action.type) {
    case 'SET_COLOR':
      return {...state, selectedColor: action.payload};
    case 'SET_TOOL':
      return {...state, activeTool: action.payload};
    case 'SET_BRUSH_WIDTH':
      return {...state, brushWidth: action.payload};
    case 'PAINT_PATH': {
      const {pathId} = action.payload;
      let nextMap = {...state.colorMap};
      if (state.activeTool === 'erase') {
        delete nextMap[pathId];
      } else {
        nextMap = {...nextMap, [pathId]: state.selectedColor};
      }
      const updated = {...state, colorMap: nextMap};
      return addToHistory(updated, nextMap, state.brushStrokes);
    }
    case 'ADD_BRUSH_STROKE': {
      const newStrokes = [...state.brushStrokes, action.payload];
      const updated = {...state, brushStrokes: newStrokes};
      return addToHistory(updated, state.colorMap, newStrokes);
    }
    case 'UNDO': {
      if (state.historyIndex <= 0) {
        return state;
      }
      const prevIndex = state.historyIndex - 1;
      const prevState = state.history[prevIndex];
      return {
        ...state,
        colorMap: prevState.colorMap,
        brushStrokes: prevState.brushStrokes,
        historyIndex: prevIndex,
      };
    }
    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) {
        return state;
      }
      const nextIndex = state.historyIndex + 1;
      const nextState = state.history[nextIndex];
      return {
        ...state,
        colorMap: nextState.colorMap,
        brushStrokes: nextState.brushStrokes,
        historyIndex: nextIndex,
      };
    }
    case 'RESET': {
      const resetState = {
        ...state,
        colorMap: {},
        brushStrokes: [],
      };
      return addToHistory(resetState, {}, []);
    }
    case 'RESET_WITH_COLOR': {
      const resetState = {
        selectedColor: action.payload,
        activeTool: 'fill' as ColoringTool,
        colorMap: {},
        brushStrokes: [],
        brushWidth: state.brushWidth,
        history: [createHistoryEntry({}, [])],
        historyIndex: 0,
      };
      return resetState;
    }
    default:
      return state;
  }
};

