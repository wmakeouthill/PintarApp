import {ColoringPage} from '../models/coloringTypes';

export const coloringLibrary: ColoringPage[] = [
  {
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
  },
  {
    id: 'flora-lunar',
    name: 'Flora Lunar',
    description: 'Folhagens suaves com lua central para degradês delicados.',
    viewBox: '0 0 320 320',
    palette: ['#F97316', '#FACC15', '#34D399', '#38BDF8', '#6366F1', '#F472B6'],
    paths: [
      {
        id: 'moon',
        d: 'M160 80 C190 80 215 105 215 135 C215 165 190 190 160 190 C130 190 105 165 105 135 C105 105 130 80 160 80 Z',
        strokeWidth: 1.5,
      },
      {
        id: 'leaf-left-top',
        d: 'M80 60 C40 120 60 190 100 210 C80 160 85 120 110 80 Z',
      },
      {
        id: 'leaf-left-bottom',
        d: 'M90 210 C40 230 60 290 120 300 C110 270 120 240 150 220 Z',
      },
      {
        id: 'leaf-right-top',
        d: 'M240 60 C280 120 260 190 220 210 C240 160 235 120 210 80 Z',
      },
      {
        id: 'leaf-right-bottom',
        d: 'M230 210 C280 230 260 290 200 300 C210 270 200 240 170 220 Z',
      },
    ],
  },
];


