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
  parseAttributeValue: true,
  parseTrueNumberOnly: false,
  trimValues: true,
  ignoreNameSpace: true, // Ignora namespaces para facilitar parsing
  removeNSPrefix: true, // Remove prefixos de namespace
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
  
  // Log para debug (pode ser removido depois)
  console.log(`[SVG Import] Encontrados ${paths.length} paths no SVG`);
  
  if (!paths.length) {
    // Tenta uma busca mais agressiva se não encontrou paths
    const allPaths = findAllPaths(svgNode);
    if (allPaths.length > 0) {
      console.log(`[SVG Import] Busca alternativa encontrou ${allPaths.length} paths`);
      return {
        id: `custom-${Date.now().toString(36)}`,
        name: options.name?.trim() || svgNode['@_id'] || `Arte-${Date.now().toString(36)}`,
        description: options.description ?? 'Importado manualmente',
        viewBox,
        palette:
          options.palette ??
          ['#1e1e1e', '#9CA3AF', '#F3F4F6', '#2563EB', '#EC4899', '#F59E0B'],
        paths: allPaths,
      };
    }
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

const extractPaths = (node: any, acc: ColoringPath[] = [], depth: number = 0): ColoringPath[] => {
  if (!node || typeof node !== 'object') {
    return acc;
  }

  // Limita profundidade para evitar loops infinitos
  if (depth > 50) {
    return acc;
  }

  const handlePath = (pathNode: any, index: number) => {
    if (!pathNode || typeof pathNode !== 'object') {
      return;
    }
    const d = pathNode['@_d'];
    if (!d || typeof d !== 'string' || d.trim().length === 0) {
      return;
    }
    const id =
      pathNode['@_id'] ??
      pathNode['@_data-name'] ??
      `path-${Math.random().toString(36).slice(2, 8)}-${index}`;
    
    // Evita duplicatas verificando se já existe um path com o mesmo id e d
    const isDuplicate = acc.some(p => p.id === id && p.d === d);
    if (isDuplicate) {
      return;
    }
    
    acc.push({
      id,
      d,
      strokeWidth: pathNode['@_stroke-width']
        ? Number(pathNode['@_stroke-width'])
        : undefined,
      fillRule: pathNode['@_fill-rule'] || pathNode['@_fillRule'],
    });
  };

  // Processa elementos path diretamente
  if (node.path) {
    if (Array.isArray(node.path)) {
      node.path.forEach((p: any, index: number) => handlePath(p, index));
    } else {
      handlePath(node.path, acc.length);
    }
  }

  // Processa todos os outros elementos recursivamente
  // Ignora apenas atributos (que começam com @_) e propriedades especiais
  Object.keys(node).forEach(key => {
    // Ignora atributos e propriedades já processadas
    if (key === 'path' || key.startsWith('@_')) {
      return;
    }

    const value = node[key];
    
    // Se for array, processa cada elemento
    if (Array.isArray(value)) {
      value.forEach(child => {
        if (child && typeof child === 'object') {
          extractPaths(child, acc, depth + 1);
        }
      });
    } 
    // Se for objeto, processa recursivamente
    else if (value && typeof value === 'object') {
      // Verifica se é um elemento path com outro nome (pode acontecer com namespaces)
      if (key.toLowerCase().includes('path') || value['@_d']) {
        handlePath(value, acc.length);
      }
      // Processa recursivamente
      extractPaths(value, acc, depth + 1);
    }
  });

  return acc;
};

// Função alternativa de busca mais agressiva para encontrar paths
const findAllPaths = (node: any, acc: ColoringPath[] = []): ColoringPath[] => {
  if (!node || typeof node !== 'object') {
    return acc;
  }

  // Busca recursiva em todos os objetos
  const searchInObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Verifica se este objeto tem um atributo 'd' (é um path)
    if (obj['@_d'] && typeof obj['@_d'] === 'string' && obj['@_d'].trim().length > 0) {
      const id =
        obj['@_id'] ??
        obj['@_data-name'] ??
        `path-${acc.length}-${Math.random().toString(36).slice(2, 8)}`;
      
      // Verifica duplicatas pelo conteúdo 'd' para evitar paths idênticos
      const isDuplicate = acc.some(p => p.d === obj['@_d']);
      if (!isDuplicate) {
        acc.push({
          id,
          d: obj['@_d'],
          strokeWidth: obj['@_stroke-width']
            ? Number(obj['@_stroke-width'])
            : undefined,
          fillRule: obj['@_fill-rule'] || obj['@_fillRule'],
        });
      }
    }

    // Busca recursivamente em todas as propriedades
    Object.keys(obj).forEach(key => {
      if (key.startsWith('@_')) {
        return; // Pula atributos
      }
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach(item => searchInObject(item));
      } else if (value && typeof value === 'object') {
        searchInObject(value);
      }
    });
  };

  searchInObject(node);
  return acc;
};


