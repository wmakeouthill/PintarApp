import React, {useEffect, useRef, useState} from 'react';
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

  const constrainTransform = (
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

    const maxTx = Math.max(0, (scaledWidth - containerW) / 2);
    const maxTy = Math.max(0, (scaledHeight - containerH) / 2);

    const constrainedTx = Math.max(-maxTx, Math.min(maxTx, tx));
    const constrainedTy = Math.max(-maxTy, Math.min(maxTy, ty));

    return {
      scale: constrainedScale,
      translateX: constrainedTx,
      translateY: constrainedTy,
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        activeTool !== 'brush' && activeTool !== 'fill' && activeTool !== 'erase',
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (activeTool === 'brush' || activeTool === 'fill' || activeTool === 'erase') {
          return false;
        }
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: evt => {
        const current = transformRef.current;
        lastPanRef.current = {x: current.translateX, y: current.translateY};
        lastScaleRef.current = current.scale;
        if (evt.nativeEvent.touches.length === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          initialDistanceRef.current = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2),
          );
        } else {
          initialDistanceRef.current = null;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2 && initialDistanceRef.current !== null) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          const currentDistance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2),
          );
          const newScale = (currentDistance / initialDistanceRef.current) * lastScaleRef.current;
          const constrained = constrainTransform(
            newScale,
            lastPanRef.current.x,
            lastPanRef.current.y,
            containerSize.width,
            containerSize.height,
          );
          setTransform(constrained);
        } else if (evt.nativeEvent.touches.length === 1 && initialDistanceRef.current === null) {
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
      },
    }),
  ).current;

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

