export type ColoringTool = 'fill' | 'erase';

export type ColoringPath = {
  id: string;
  d: string;
  strokeWidth?: number;
  fillRule?: 'evenodd' | 'nonzero';
};

export type ColoringPage = {
  id: string;
  name: string;
  viewBox: string;
  description?: string;
  palette: string[];
  paths: ColoringPath[];
};

