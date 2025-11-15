import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {PanResponder, StyleSheet, View} from 'react-native';
import Svg, {ClipPath, Defs, Path} from 'react-native-svg';

import {colors, spacing} from '@/core/theme';
import {BrushOverlay} from './BrushOverlay';
import {BrushStroke} from '../state/coloringReducer';
import {ColoringPage, ColoringTool} from '../models/coloringTypes';

type SvgColoringSurfaceProps = {
  page: ColoringPage;
  colorMap: Record<string, string>;
  brushStrokes: BrushStroke[];
  activeTool: ColoringTool;
  selectedColor: string;
  brushWidth: number;
  onPathPress: (pathId: string) => void;
  onColorPick?: (color: string) => void;
  onBrushStroke?: (stroke: BrushStroke) => void;
};

type TransformState = {
  scale: number;
  translateX: number;
  translateY: number;
};

export const SvgColoringSurface: React.FC<SvgColoringSurfaceProps> = ({
  page,
  colorMap,
  brushStrokes,
  activeTool,
  selectedColor,
  brushWidth,
  onPathPress,
  onColorPick,
  onBrushStroke,
}) => {
  const [containerSize, setContainerSize] = useState({width: 0, height: 0});
  const [selectedPathForBrush, setSelectedPathForBrush] = useState<string | null>(null);
  const [transform, setTransform] = useState<TransformState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const lastPanRef = useRef({x: 0, y: 0});
  const lastScaleRef = useRef(1);
  const transformRef = useRef<TransformState>(transform);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const handlePathPress = (pathId: string) => {
    if (activeTool === 'eyedropper' && onColorPick) {
      const color = colorMap[pathId] || '#FFFFFF';
      onColorPick(color);
      return;
    }
    if (activeTool === 'brush') {
      setSelectedPathForBrush(pathId);
      return;
    }
    if (activeTool === 'fill' || activeTool === 'erase') {
      onPathPress(pathId);
    }
  };

  const initialDistanceRef = useRef<number | null>(null);
  const [viewBox] = useState(() => {
    const [vx, vy, vw, vh] = page.viewBox.split(' ').map(Number);
    return {x: vx, y: vy, width: vw, height: vh};
  });

  const constrainTransform = useCallback((
    scale: number,
    tx: number,
    ty: number,
    containerW: number,
    containerH: number,
  ): TransformState => {
    const minScale = 0.5;
    const maxScale = 5;
    const constrainedScale = Math.max(minScale, Math.min(maxScale, scale));

    const scaledWidth = viewBox.width * constrainedScale;
    const scaledHeight = viewBox.height * constrainedScale;

    // Permitir movimento quando o SVG é menor que o container (espaço em branco)
    const maxTx = scaledWidth > containerW 
      ? (scaledWidth - containerW) / 2 
      : Math.max(0, (containerW - scaledWidth) / 2) + 100; // Permitir movimento de até 100px além do limite
    
    const maxTy = scaledHeight > containerH 
      ? (scaledHeight - containerH) / 2 
      : Math.max(0, (containerH - scaledHeight) / 2) + 100; // Permitir movimento de até 100px além do limite

    const constrainedTx = Math.max(-maxTx, Math.min(maxTx, tx));
    const constrainedTy = Math.max(-maxTy, Math.min(maxTy, ty));

    return {
      scale: constrainedScale,
      translateX: constrainedTx,
      translateY: constrainedTy,
    };
  }, [viewBox.width, viewBox.height]);

  const isZoomModeRef = useRef(false);
  const panStartRef = useRef<{x: number; y: number} | null>(null);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          // Sempre permitir zoom com dois dedos
          if (evt.nativeEvent.touches.length === 2) {
            isZoomModeRef.current = true;
            return true;
          }
          // Para pan, verificar se não é uma ação de pintura
          // Permitir pan quando não estiver pintando diretamente
          if (activeTool === 'brush') {
            // Para brush, só permitir pan/zoom se for dois dedos ou se não houver path selecionado
            return false;
          }
          // Para outras ferramentas, permitir pan se houver movimento significativo
          return false; // Deixa o onMoveShouldSetPanResponder decidir
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Sempre permitir zoom com dois dedos
          if (evt.nativeEvent.touches.length === 2) {
            isZoomModeRef.current = true;
            return true;
          }
          // Para pan, só ativar se houver movimento significativo e não estiver pintando
          if (activeTool === 'brush') {
            // Não interferir com brush quando estiver pintando
            return false;
          }
          // Permitir pan quando houver movimento significativo
          const hasMovement = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
          if (hasMovement) {
            isZoomModeRef.current = false;
            return true;
          }
          return false;
        },
        onPanResponderTerminationRequest: () => {
          // Não permitir que outros componentes peguem o controle durante zoom/pan
          return !isZoomModeRef.current;
        },
        onPanResponderGrant: evt => {
          const current = transformRef.current;
          lastPanRef.current = {x: current.translateX, y: current.translateY};
          lastScaleRef.current = current.scale;
          
          if (evt.nativeEvent.touches.length === 2) {
            isZoomModeRef.current = true;
            const touch1 = evt.nativeEvent.touches[0];
            const touch2 = evt.nativeEvent.touches[1];
            initialDistanceRef.current = Math.sqrt(
              Math.pow(touch2.pageX - touch1.pageX, 2) +
              Math.pow(touch2.pageY - touch1.pageY, 2),
            );
            // Calcular o ponto médio para zoom centrado
            panStartRef.current = {
              x: (touch1.pageX + touch2.pageX) / 2,
              y: (touch1.pageY + touch2.pageY) / 2,
            };
          } else {
            isZoomModeRef.current = false;
            initialDistanceRef.current = null;
            const {locationX, locationY} = evt.nativeEvent;
            panStartRef.current = {x: locationX, y: locationY};
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          if (evt.nativeEvent.touches.length === 2 && initialDistanceRef.current !== null) {
            // Zoom com pinch
            const touch1 = evt.nativeEvent.touches[0];
            const touch2 = evt.nativeEvent.touches[1];
            const currentDistance = Math.sqrt(
              Math.pow(touch2.pageX - touch1.pageX, 2) +
              Math.pow(touch2.pageY - touch1.pageY, 2),
            );
            const scaleFactor = currentDistance / initialDistanceRef.current;
            const newScale = lastScaleRef.current * scaleFactor;
            
            // Calcular novo ponto médio
            const currentMidPoint = {
              x: (touch1.pageX + touch2.pageX) / 2,
              y: (touch1.pageY + touch2.pageY) / 2,
            };
            
            // Ajustar pan para manter o ponto médio fixo durante o zoom
            const scaleChange = newScale / lastScaleRef.current;
            const dx = (currentMidPoint.x - panStartRef.current!.x) * (1 - 1 / scaleChange);
            const dy = (currentMidPoint.y - panStartRef.current!.y) * (1 - 1 / scaleChange);
            
            const newTx = lastPanRef.current.x - dx;
            const newTy = lastPanRef.current.y - dy;
            
            const constrained = constrainTransform(
              newScale,
              newTx,
              newTy,
              containerSize.width,
              containerSize.height,
            );
            setTransform(constrained);
          } else if (evt.nativeEvent.touches.length === 1 && initialDistanceRef.current === null && !isZoomModeRef.current) {
            // Pan com um dedo
            const newTx = lastPanRef.current.x + gestureState.dx;
            const newTy = lastPanRef.current.y + gestureState.dy;
            const constrained = constrainTransform(
              lastScaleRef.current,
              newTx,
              newTy,
              containerSize.width,
              containerSize.height,
            );
            setTransform(constrained);
          }
        },
        onPanResponderRelease: () => {
          const constrained = constrainTransform(
            transformRef.current.scale,
            transformRef.current.translateX,
            transformRef.current.translateY,
            containerSize.width,
            containerSize.height,
          );
          setTransform(constrained);
          initialDistanceRef.current = null;
          isZoomModeRef.current = false;
          panStartRef.current = null;
        },
      }),
    [activeTool, containerSize.width, containerSize.height, constrainTransform],
  );

  return (
    <View
      style={styles.canvasContainer}
      onLayout={e => {
        const {width, height} = e.nativeEvent.layout;
        setContainerSize({width, height});
      }}>
      <View
        style={styles.svgContainer}
        {...panResponder.panHandlers}>
          <View
            style={[
              styles.svgWrapper,
              {
                transform: [
                  {translateX: transform.translateX},
                  {translateY: transform.translateY},
                  {scale: transform.scale},
                ],
              },
            ]}>
          <Svg
            viewBox={page.viewBox}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet">
            <Defs>
              {brushStrokes
                .filter(s => s.clipPathId)
                .map(stroke => {
                  const path = page.paths.find(p => p.id === stroke.clipPathId);
                  if (!path) {
                    return null;
                  }
                  return (
                    <ClipPath key={`clip-${stroke.id}`} id={`clip-${stroke.id}`}>
                      <Path d={path.d} />
                    </ClipPath>
                  );
                })}
            </Defs>
            {page.paths.map(path => (
              <Path
                key={path.id}
                d={path.d}
                fill={colorMap[path.id] ?? '#FFFFFF'}
                stroke={colors.border}
                strokeWidth={path.strokeWidth ?? 1.5}
                onPress={() => handlePathPress(path.id)}
              />
            ))}
            {brushStrokes.map(stroke => {
              const [,, vw, vh] = page.viewBox.split(' ').map(Number);
              const avgSize = (vw + vh) / 2;
              const containerAvg = (containerSize.width + containerSize.height) / 2;
              const viewBoxWidth = (stroke.width / containerAvg) * avgSize;
              return (
                <Path
                  key={stroke.id}
                  d={stroke.d}
                  stroke={stroke.color}
                  strokeWidth={viewBoxWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  clipPath={stroke.clipPathId ? `url(#clip-${stroke.id})` : undefined}
                />
              );
            })}
          </Svg>
          {activeTool === 'brush' && onBrushStroke && containerSize.width > 0 && (
            <BrushOverlay
              width={containerSize.width}
              height={containerSize.height}
              paths={page.paths}
              color={selectedColor}
              strokeWidth={brushWidth}
              selectedPathId={selectedPathForBrush}
              viewBox={page.viewBox}
              transform={transform}
              onStrokeComplete={onBrushStroke}
            />
          )}
          </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  svgWrapper: {
    width: '100%',
    height: '100%',
  },
});

