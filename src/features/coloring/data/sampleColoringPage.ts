import {ColoringPage} from '../models/coloringTypes';

export const sampleColoringPage: ColoringPage = {
  id: 'butterfly-aurora',
  name: 'Borboleta Aurora',
  description: 'Cenário vetorial simples para testar ferramentas de pintura.',
  viewBox: '0 0 300 300',
  palette: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#A8E6CF', '#5B5F97', '#F4A259'],
  paths: [
    {
      id: 'body',
      d: 'M145 70 C150 50 160 50 165 70 L175 200 C175 215 155 235 150 235 C145 235 125 215 125 200 L135 70 C138 50 150 50 155 70 Z',
      strokeWidth: 2,
    },
    {
      id: 'left-wing-top',
      d: 'M150 110 C90 10 30 120 70 160 C30 190 60 230 120 220 C110 180 120 130 150 110 Z',
    },
    {
      id: 'right-wing-top',
      d: 'M150 110 C210 10 270 120 230 160 C270 190 240 230 180 220 C190 180 180 130 150 110 Z',
    },
    {
      id: 'left-wing-bottom',
      d: 'M145 170 C80 170 50 230 90 260 C120 280 140 250 145 230 Z',
    },
    {
      id: 'right-wing-bottom',
      d: 'M155 170 C220 170 250 230 210 260 C180 280 160 250 155 230 Z',
    },
    {
      id: 'head',
      d: 'M140 55 C140 40 160 40 160 55 C160 65 140 65 140 55 Z',
      strokeWidth: 1.5,
    },
  ],
};

