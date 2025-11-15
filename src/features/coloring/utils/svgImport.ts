import {XMLParser} from 'fast-xml-parser';

import {ColoringPage, ColoringPath} from '../models/coloringTypes';

type ConvertOptions = {
  name?: string;
  description?: string;
  palette?: string[];
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

export const convertSvgToColoringPage = (
  svgString: string,
  options: ConvertOptions = {},
): ColoringPage => {
  if (!svgString.trim()) {
    throw new Error('Cole o conteúdo completo do SVG.');
  }

  const parsed = parser.parse(svgString);
  const svgNode = parsed.svg || parsed['svg:svg'];

  if (!svgNode) {
    throw new Error('Não foi possível encontrar a tag <svg>.');
  }

  const viewBox =
    svgNode['@_viewBox'] ??
    `0 0 ${svgNode['@_width'] ?? 300} ${svgNode['@_height'] ?? 300}`;

  const paths = extractPaths(svgNode);
  if (!paths.length) {
    throw new Error(
      'Nenhum elemento <path> foi encontrado. Utilize SVGs compostos por paths.',
    );
  }

  const name =
    options.name?.trim() || svgNode['@_id'] || `Arte-${Date.now().toString(36)}`;

  return {
    id: `custom-${Date.now().toString(36)}`,
    name,
    description: options.description ?? 'Importado manualmente',
    viewBox,
    palette:
      options.palette ??
      ['#1e1e1e', '#9CA3AF', '#F3F4F6', '#2563EB', '#EC4899', '#F59E0B'],
    paths,
  };
};

const extractPaths = (node: any, acc: ColoringPath[] = []): ColoringPath[] => {
  if (!node || typeof node !== 'object') {
    return acc;
  }

  const handlePath = (pathNode: any, index: number) => {
    if (!pathNode || typeof pathNode !== 'object') {
      return;
    }
    const d = pathNode['@_d'];
    if (!d) {
      return;
    }
    const id =
      pathNode['@_id'] ?? `path-${Math.random().toString(36).slice(2, 8)}-${index}`;
    acc.push({
      id,
      d,
      strokeWidth: pathNode['@_stroke-width']
        ? Number(pathNode['@_stroke-width'])
        : undefined,
      fillRule: pathNode['@_fill-rule'],
    });
  };

  if (node.path) {
    if (Array.isArray(node.path)) {
      node.path.forEach((p: any, index: number) => handlePath(p, index));
    } else {
      handlePath(node.path, 0);
    }
  }

  Object.keys(node).forEach(key => {
    if (key === 'path' || key.startsWith('@_')) {
      return;
    }
    const value = node[key];
    if (Array.isArray(value)) {
      value.forEach(child => extractPaths(child, acc));
    } else if (typeof value === 'object') {
      extractPaths(value, acc);
    }
  });

  return acc;
};


