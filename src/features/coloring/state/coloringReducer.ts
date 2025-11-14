import {ColoringTool} from '../models/coloringTypes';

export type ColoringState = {
  selectedColor: string;
  activeTool: ColoringTool;
  colorMap: Record<string, string>;
};

type ColoringAction =
  | {type: 'SET_COLOR'; payload: string}
  | {type: 'SET_TOOL'; payload: ColoringTool}
  | {type: 'PAINT_PATH'; payload: {pathId: string}}
  | {type: 'RESET'};

export const createInitialColoringState = (
  defaultColor: string,
): ColoringState => ({
  selectedColor: defaultColor,
  activeTool: 'fill',
  colorMap: {},
});

export const coloringReducer = (
  state: ColoringState,
  action: ColoringAction,
): ColoringState => {
  switch (action.type) {
    case 'SET_COLOR':
      return {...state, selectedColor: action.payload};
    case 'SET_TOOL':
      return {...state, activeTool: action.payload};
    case 'PAINT_PATH': {
      const {pathId} = action.payload;
      if (state.activeTool === 'erase') {
        const nextMap = {...state.colorMap};
        delete nextMap[pathId];
        return {...state, colorMap: nextMap};
      }

      return {
        ...state,
        colorMap: {
          ...state.colorMap,
          [pathId]: state.selectedColor,
        },
      };
    }
    case 'RESET':
      return {...state, colorMap: {}};
    default:
      return state;
  }
};

